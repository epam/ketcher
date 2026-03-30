import type { OutputMessageWrapper } from '../indigoWorker.types';

const mockWorker = {
  onmessage: null as ((event: OutputMessageWrapper) => void) | null,
  postMessage: jest.fn(),
  terminate: jest.fn(),
};

jest.mock(
  '_indigo-worker-import-alias_',
  () => ({
    __esModule: true,
    indigoWorker: mockWorker,
  }),
  { virtual: true },
);

jest.mock(
  'ketcher-core',
  () => ({
    __esModule: true,
    ChemicalMimeType: {
      DaylightSmiles: 'chemical/x-daylight-smiles',
    },
    CoreEditor: {
      provideEditorInstance: () => undefined,
    },
    getLabelRenderModeForIndigo: () => undefined,
    pickStandardServerOptions: (_ketcherId?: string | null, options = {}) =>
      options,
  }),
  { virtual: true },
);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: IndigoService } = require('../standaloneStructService');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Command, SupportedFormat } = require('../indigoWorker.types');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ChemicalMimeType } = require('ketcher-core');

describe('StandaloneStructService convert', () => {
  const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

  beforeEach(() => {
    mockWorker.onmessage = null;
    mockWorker.postMessage.mockClear();
    mockWorker.terminate.mockClear();
  });

  it('resolves when convert response omits inputData', async () => {
    const service = new IndigoService({});
    const promise = service.convert({
      struct: 'ket-struct',
      output_format: ChemicalMimeType.DaylightSmiles,
    });

    await flushPromises();

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: Command.Convert,
      data: {
        struct: 'ket-struct',
        format: SupportedFormat.Smiles,
        options: {
          monomerLibrary: undefined,
        },
      },
    });

    mockWorker.onmessage?.({
      data: {
        type: Command.Convert,
        payload: 'C',
      },
    });

    await expect(promise).resolves.toEqual({
      struct: 'C',
      format: ChemicalMimeType.DaylightSmiles,
    });
  });

  it('queues concurrent convert requests until the previous response is handled', async () => {
    const service = new IndigoService({});
    const firstPromise = service.convert({
      struct: 'first-struct',
      output_format: ChemicalMimeType.DaylightSmiles,
    });
    const secondPromise = service.convert({
      struct: 'second-struct',
      output_format: ChemicalMimeType.DaylightSmiles,
    });

    await flushPromises();

    expect(mockWorker.postMessage).toHaveBeenCalledTimes(1);
    expect(mockWorker.postMessage).toHaveBeenLastCalledWith({
      type: Command.Convert,
      data: {
        struct: 'first-struct',
        format: SupportedFormat.Smiles,
        options: {
          monomerLibrary: undefined,
        },
      },
    });

    mockWorker.onmessage?.({
      data: {
        type: Command.Convert,
        payload: 'C',
      },
    });

    await expect(firstPromise).resolves.toEqual({
      struct: 'C',
      format: ChemicalMimeType.DaylightSmiles,
    });

    await flushPromises();

    expect(mockWorker.postMessage).toHaveBeenCalledTimes(2);
    expect(mockWorker.postMessage).toHaveBeenLastCalledWith({
      type: Command.Convert,
      data: {
        struct: 'second-struct',
        format: SupportedFormat.Smiles,
        options: {
          monomerLibrary: undefined,
        },
      },
    });

    mockWorker.onmessage?.({
      data: {
        type: Command.Convert,
        payload: 'CC',
      },
    });

    await expect(secondPromise).resolves.toEqual({
      struct: 'CC',
      format: ChemicalMimeType.DaylightSmiles,
    });
  });
});
