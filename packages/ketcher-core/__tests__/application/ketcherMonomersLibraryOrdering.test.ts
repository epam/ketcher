import { mock } from 'jest-mock-extended';
import {
  CoreEditor,
  type Editor as MicromoleculeEditor,
  resetEditorInstance,
  setEditorInstance,
} from 'application/editor';
import { Ketcher } from 'application/ketcher';
import { ketcherProvider } from 'application/ketcherProvider';
import type { FormatterFactory } from 'application/formatters';
import type { StructService } from 'domain/services';
import { ChemicalMimeType } from 'domain/services/struct/structService.types';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../helpers/dom';
import { coreEditorTheme, polymerEditorTheme } from '../mock-data';

// Lets any microtask chain that does NOT depend on a still-pending promise
// (e.g. the consumer's replace/update call, pre-fix) run to completion,
// without depending on - or deadlocking behind - that pending promise.
// `setTimeout` only fires once the whole microtask queue has drained, so this
// deterministically captures "whatever settles on its own settles first".
const flushMicrotasks = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 0));

// Regression test for: Ketcher.updateMonomersLibrary()/replaceMonomersLibrary()
// used to apply the consumer's library without waiting for the lazily-loaded
// default monomers library. If the default load was already in flight (e.g.
// started by something else on mount) and resolved *after* the consumer's
// call, its resolution clobbered the consumer's library because
// `setMonomersLibrary` overwrites `_monomersLibrary`/`_monomersLibraryParsedJson`
// wholesale. See #10326 and the ADR:
// .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
describe('Ketcher monomer library ordering vs. the lazy default load', () => {
  let canvas: SVGSVGElement;
  let coreEditor: CoreEditor;
  let ketcher: Ketcher;

  const DEFAULT_MONOMER_NAME = 'DEFAULTCHEM';
  const CONSUMER_MONOMER_NAME = 'CONSUMERCHEM';

  const makeMonomer = (name: string) => ({
    root: { templates: [{ $ref: `monomerTemplate-${name}` }] },
    [`monomerTemplate-${name}`]: {
      type: 'monomerTemplate',
      id: name,
      class: 'CHEM',
      classHELM: 'CHEM',
      fullName: `${name} full name`,
      name,
      naturalAnalogShort: 'X',
      props: {
        MonomerName: name,
        MonomerClass: 'CHEM',
        Name: name,
        MonomerNaturalAnalogCode: 'X',
      },
    },
  });

  const defaultMonomer = makeMonomer(DEFAULT_MONOMER_NAME);
  const consumerMonomer = makeMonomer(CONSUMER_MONOMER_NAME);

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    coreEditor = new CoreEditor({
      canvas,
      theme: coreEditorTheme,
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
    setEditorInstance(coreEditor);

    const structService = mock<StructService>();
    structService.convert.mockResolvedValue({
      struct: 'SDF_PLACEHOLDER',
      format: ChemicalMimeType.MonomerLibrary,
    });
    const formatterFactory = mock<FormatterFactory>();

    ketcher = new Ketcher(structService, formatterFactory);
    const micromoleculeEditor = mock<MicromoleculeEditor>();
    Object.defineProperty(micromoleculeEditor, 'serverSettings', {
      value: {},
    });
    ketcher.addEditor(micromoleculeEditor);
    ketcherProvider.addKetcherInstance(ketcher);
  });

  afterEach(() => {
    ketcherProvider.removeKetcherInstance(ketcher.id);
    resetEditorInstance(coreEditor.ketcherId);
    jest.restoreAllMocks();
  });

  // Deferred default load: the "default" library is only applied once
  // `resolveDefaultLoad()` is invoked, letting the test control exactly when
  // the lazy default load settles relative to the consumer's call. Mirrors
  // the real `setMonomersLibrary`'s wholesale-overwrite behavior (it replaces
  // `_monomersLibrary` outright, it does not merge into whatever is there).
  function deferDefaultMonomersLoad() {
    let resolveDefaultLoad!: () => void;
    const gate = new Promise<void>((resolve) => {
      resolveDefaultLoad = resolve;
    });

    jest
      .spyOn(
        coreEditor as unknown as {
          initializeDefaultMonomersLibrary: () => Promise<void>;
        },
        'initializeDefaultMonomersLibrary',
      )
      .mockImplementation(async () => {
        await gate;
        coreEditor.clearMonomersLibrary();
        coreEditor.updateMonomersLibrary(JSON.stringify(defaultMonomer));
      });

    return { resolveDefaultLoad };
  }

  it('keeps the consumer library in place after replaceMonomersLibrary races the pending default load', async () => {
    const { resolveDefaultLoad } = deferDefaultMonomersLoad();

    // Something else (e.g. app start-up) already kicked off the default load
    // in the background, without awaiting it.
    const backgroundDefaultLoad =
      coreEditor.ensureDefaultMonomersLibraryLoaded();

    // The consumer replaces the library before the default load has resolved.
    const replacePromise = ketcher.replaceMonomersLibrary(
      JSON.stringify(consumerMonomer),
    );

    // Give the consumer's call every chance to finish on its own (pre-fix,
    // it doesn't depend on the default load at all) before the default load
    // is allowed to resolve.
    await flushMicrotasks();

    // Now let the default load resolve.
    resolveDefaultLoad();
    await backgroundDefaultLoad;
    await replacePromise;

    const names = coreEditor.monomersLibrary.map(
      (item) => item.props.MonomerName,
    );
    expect(names).toContain(CONSUMER_MONOMER_NAME);
    expect(names).not.toContain(DEFAULT_MONOMER_NAME);
  });

  it('keeps the consumer library in place after updateMonomersLibrary races the pending default load', async () => {
    const { resolveDefaultLoad } = deferDefaultMonomersLoad();

    const backgroundDefaultLoad =
      coreEditor.ensureDefaultMonomersLibraryLoaded();

    const updatePromise = ketcher.updateMonomersLibrary(
      JSON.stringify(consumerMonomer),
    );

    await flushMicrotasks();

    resolveDefaultLoad();
    await backgroundDefaultLoad;
    await updatePromise;

    const names = coreEditor.monomersLibrary.map(
      (item) => item.props.MonomerName,
    );
    expect(names).toContain(CONSUMER_MONOMER_NAME);
    expect(names).toContain(DEFAULT_MONOMER_NAME);
  });

  // The mirror image of the two races above: the consumer's call is the one
  // that starts the default load (nothing else was in flight yet), and a
  // second, independent request for it - e.g. app start-up mounting
  // macromolecules mode a beat later - only joins the same memoized promise
  // afterwards. The consumer's own write must still win: it runs after the
  // default-load's apply-on-resolve side effect, inside the same awaited
  // call chain that triggered it.
  it('keeps the consumer library in place when replaceMonomersLibrary starts the default load itself', async () => {
    const { resolveDefaultLoad } = deferDefaultMonomersLoad();

    // The consumer's call is issued first; it is the one that kicks off
    // `ensureDefaultMonomersLibraryLoaded()`.
    const replacePromise = ketcher.replaceMonomersLibrary(
      JSON.stringify(consumerMonomer),
    );

    // Something else (e.g. app start-up) only requests the default load
    // afterwards - it joins the promise the consumer's call already started.
    await flushMicrotasks();
    const backgroundDefaultLoad =
      coreEditor.ensureDefaultMonomersLibraryLoaded();

    resolveDefaultLoad();
    await backgroundDefaultLoad;
    await replacePromise;

    const names = coreEditor.monomersLibrary.map(
      (item) => item.props.MonomerName,
    );
    expect(names).toContain(CONSUMER_MONOMER_NAME);
    expect(names).not.toContain(DEFAULT_MONOMER_NAME);
  });

  it('keeps the consumer library in place when updateMonomersLibrary starts the default load itself', async () => {
    const { resolveDefaultLoad } = deferDefaultMonomersLoad();

    const updatePromise = ketcher.updateMonomersLibrary(
      JSON.stringify(consumerMonomer),
    );

    await flushMicrotasks();
    const backgroundDefaultLoad =
      coreEditor.ensureDefaultMonomersLibraryLoaded();

    resolveDefaultLoad();
    await backgroundDefaultLoad;
    await updatePromise;

    const names = coreEditor.monomersLibrary.map(
      (item) => item.props.MonomerName,
    );
    expect(names).toContain(CONSUMER_MONOMER_NAME);
    expect(names).toContain(DEFAULT_MONOMER_NAME);
  });
});
