import { provideEditorInstance } from 'application/editor/editorSingleton';
import type { Mock } from 'vitest';
import { ChemicalMimeType } from 'domain/services/struct/structService.types';
import { RemoteStructService } from '../remoteStructService';

vi.mock('application/editor/editorSingleton', () => ({
  provideEditorInstance: vi.fn(),
}));

describe('RemoteStructService.convert monomer library', () => {
  const originalFetch = global.fetch;
  const fetchMock = vi.fn();
  const ensureDefaultMonomersLibraryLoaded = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ struct: 'converted' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    (provideEditorInstance as Mock).mockReturnValue({
      monomersLibraryParsedJson: { monomers: ['library entry'] },
      ensureDefaultMonomersLibraryLoaded,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('skips library transfer only when the caller explicitly requests it', async () => {
    const service = new RemoteStructService('http://localhost/v2/', {});

    await service.convert(
      { struct: '{"nodes":[]}', output_format: ChemicalMimeType.Mol },
      undefined,
      { skipMonomerLibraryTransfer: true },
    );

    const [, requestOptions] = fetchMock.mock.calls[0];
    const requestBody = JSON.parse(requestOptions.body);
    expect(requestBody.options).not.toHaveProperty('monomerLibrary');
    expect(ensureDefaultMonomersLibraryLoaded).not.toHaveBeenCalled();
  });

  it('preserves library transfer by default for other conversions', async () => {
    const service = new RemoteStructService('http://localhost/v2/', {});

    await service.convert({
      struct: 'external input',
      output_format: ChemicalMimeType.KET,
    });

    const [, requestOptions] = fetchMock.mock.calls[0];
    const requestBody = JSON.parse(requestOptions.body);
    expect(ensureDefaultMonomersLibraryLoaded).toHaveBeenCalledOnce();
    expect(requestBody.options.monomerLibrary).toBe(
      JSON.stringify({ monomers: ['library entry'] }),
    );
  });

  it('keeps library transfer enabled when the caller confirms monomers are present', async () => {
    const service = new RemoteStructService('http://localhost/v2/', {});

    await service.convert(
      { struct: 'monomer structure', output_format: ChemicalMimeType.Mol },
      undefined,
      { skipMonomerLibraryTransfer: false },
    );

    const [, requestOptions] = fetchMock.mock.calls[0];
    const requestBody = JSON.parse(requestOptions.body);
    expect(requestBody.options.monomerLibrary).toBe(
      JSON.stringify({ monomers: ['library entry'] }),
    );
  });

  it('waits for the default library before serializing it', async () => {
    const editor = {
      monomersLibraryParsedJson: undefined as
        { monomers: string[] } | undefined,
      ensureDefaultMonomersLibraryLoaded: vi.fn(async () => {
        await Promise.resolve();
        editor.monomersLibraryParsedJson = { monomers: ['loaded entry'] };
      }),
    };
    (provideEditorInstance as Mock).mockReturnValue(editor);

    await new RemoteStructService('http://localhost/v2/', {}).convert({
      struct: 'external input',
      output_format: ChemicalMimeType.KET,
    });

    const [, requestOptions] = fetchMock.mock.calls[0];
    expect(JSON.parse(requestOptions.body).options.monomerLibrary).toBe(
      JSON.stringify({ monomers: ['loaded entry'] }),
    );
  });
});
