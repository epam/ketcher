import { ChemicalMimeType } from 'ketcher-core';
import StandaloneStructService from '../../../../src/infrastructure/services/struct/standaloneStructService';

// Lets any microtask chain that does NOT depend on a still-pending promise
// run to completion, without depending on - or deadlocking behind - that
// pending promise. `setTimeout` only fires once the whole microtask queue
// has drained, so this deterministically captures "whatever settles on its
// own settles first". Mirrors the core ordering test's own
// `flushMicrotasks` (ketcherMonomersLibraryOrdering.test.ts).
const flushMicrotasks = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 0));

let order: string[];
let resolveDefaultLoad: () => void;

const fakeEditor = {
  ensureDefaultMonomersLibraryLoaded: jest.fn(),
  get monomersLibraryParsedJson() {
    order.push('monomer-library-read');
    return {};
  },
};

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  provideEditorInstance: jest.fn(() => fakeEditor),
}));

// Regression/guard test for the ordering fixed by #10326 (see the ADR:
// .memory-bank/adr/2026-08-28-vite-for-library-builds.md): the default
// monomers library is a lazily fetched asset, so anything that reads it
// (here, the monomer library baked into a `convert` worker command) must
// await `ensureDefaultMonomersLibraryLoaded()` first - otherwise the worker
// can receive no monomer library when this runs before macromolecules mode
// is ever opened.
describe('StandaloneStructService (IndigoService) convert()', () => {
  beforeEach(() => {
    order = [];

    const defaultLoadGate = new Promise<void>((resolve) => {
      resolveDefaultLoad = resolve;
    });
    fakeEditor.ensureDefaultMonomersLibraryLoaded = jest.fn(async () => {
      await defaultLoadGate;
      order.push('default-library-loaded');
    });
  });

  it('awaits the default monomers library before reading it into the convert command', async () => {
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
    await flushMicrotasks();
    expect(order).toEqual([]);

    resolveDefaultLoad();
    // Let the now-unblocked microtask chain run to the point where the
    // monomer library is read into the convert command's options.
    await flushMicrotasks();

    expect(order).toEqual(['default-library-loaded', 'monomer-library-read']);
  });
});
