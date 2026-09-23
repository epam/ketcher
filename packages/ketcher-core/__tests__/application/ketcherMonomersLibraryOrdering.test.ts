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
// wholesale. See T4-monomer-library-ordering.md.
describe('Ketcher monomer library ordering vs. the lazy default load', () => {
  let canvas: SVGSVGElement;
  let coreEditor: CoreEditor;
  let ketcher: Ketcher;

  const DEFAULT_MONOMER_NAME = 'DEFAULTCHEM';
  const CONSUMER_MONOMER_NAME = 'CONSUMERCHEM';

  const defaultMonomer = {
    root: { templates: [{ $ref: `monomerTemplate-${DEFAULT_MONOMER_NAME}` }] },
    [`monomerTemplate-${DEFAULT_MONOMER_NAME}`]: {
      type: 'monomerTemplate',
      id: DEFAULT_MONOMER_NAME,
      class: 'CHEM',
      classHELM: 'CHEM',
      fullName: 'Default Chem',
      name: DEFAULT_MONOMER_NAME,
      naturalAnalogShort: 'X',
      props: {
        MonomerName: DEFAULT_MONOMER_NAME,
        MonomerClass: 'CHEM',
        Name: DEFAULT_MONOMER_NAME,
        MonomerNaturalAnalogCode: 'X',
      },
    },
  };

  const consumerMonomer = {
    root: { templates: [{ $ref: `monomerTemplate-${CONSUMER_MONOMER_NAME}` }] },
    [`monomerTemplate-${CONSUMER_MONOMER_NAME}`]: {
      type: 'monomerTemplate',
      id: CONSUMER_MONOMER_NAME,
      class: 'CHEM',
      classHELM: 'CHEM',
      fullName: 'Consumer Chem',
      name: CONSUMER_MONOMER_NAME,
      naturalAnalogShort: 'X',
      props: {
        MonomerName: CONSUMER_MONOMER_NAME,
        MonomerClass: 'CHEM',
        Name: CONSUMER_MONOMER_NAME,
        MonomerNaturalAnalogCode: 'X',
      },
    },
  };

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
});
