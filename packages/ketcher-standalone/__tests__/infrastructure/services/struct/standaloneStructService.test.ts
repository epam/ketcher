import { ChemicalMimeType } from 'ketcher-core';

const order: string[] = [];

let resolveDefaultLoad!: () => void;
const defaultLoadGate = new Promise<void>((resolve) => {
  resolveDefaultLoad = resolve;
});

const fakeEditor = {
  ensureDefaultMonomersLibraryLoaded: jest.fn(async () => {
    await defaultLoadGate;
    order.push('default-library-loaded');
  }),
  get monomersLibraryParsedJson() {
    order.push('monomer-library-read');
    return {};
  },
};

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  provideEditorInstance: jest.fn(() => fakeEditor),
}));

// Regression/guard test for the ordering fixed for Ketcher.updateMonomersLibrary
// / replaceMonomersLibrary in T4: the default monomers library is a lazily
// fetched asset, so anything that reads it (here, the monomer library baked
// into a `convert` worker command, see standaloneStructService.ts ~L399/~L425)
// must await `ensureDefaultMonomersLibraryLoaded()` first - otherwise the
// worker can receive no monomer library when this runs before macromolecules
// mode is ever opened.
describe('StandaloneStructService (IndigoService) convert()', () => {
  it('awaits the default monomers library before reading it into the convert command', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const StandaloneStructService =
      require('../../../../src/infrastructure/services/struct/standaloneStructService')
        .default as new (options: unknown) => {
        convert: (data: unknown, options?: unknown) => Promise<unknown>;
      };

    const service = new StandaloneStructService({});

    // Fire-and-forget: the worker never replies in this test, and no
    // ketcherId was registered, so this call eventually rejects while
    // building its command options - after the ordering below has already
    // been captured. Passing `request-timeout: 0` (and catching the
    // rejection) avoids leaving a 30s timer running past the test.
    void service
      .convert(
        {
          struct: 'C',
          input_format: ChemicalMimeType.Mol,
          output_format: ChemicalMimeType.Mol,
        },
        { 'request-timeout': 0 },
      )
      .catch(() => undefined);

    // Let the `convert()` call run up to its first await (on
    // ensureDefaultMonomersLibraryLoaded). It must not have read the
    // monomer library yet.
    await Promise.resolve();
    await Promise.resolve();
    expect(order).toEqual([]);

    resolveDefaultLoad();
    // Let the now-unblocked microtask chain run to the point where the
    // monomer library is read into the convert command's options.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(order).toEqual(['default-library-loaded', 'monomer-library-read']);
  });
});
