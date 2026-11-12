import { provideEditorInstance } from 'application/editor/editorSingleton';
import { ChemicalMimeType } from 'domain/services/struct/structService.types';
import { RemoteStructService } from '../remoteStructService';

jest.mock('application/editor/editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));

describe('RemoteStructService.convert monomer library', () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ struct: 'converted' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    (provideEditorInstance as jest.Mock).mockReturnValue({
      monomersLibraryParsedJson: { monomers: ['library entry'] },
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
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
  });

  it('preserves library transfer by default for other conversions', async () => {
    const service = new RemoteStructService('http://localhost/v2/', {});

    await service.convert({
      struct: 'external input',
      output_format: ChemicalMimeType.KET,
    });

    const [, requestOptions] = fetchMock.mock.calls[0];
    const requestBody = JSON.parse(requestOptions.body);
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
});
