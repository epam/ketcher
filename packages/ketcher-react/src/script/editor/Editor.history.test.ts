import {
  Action,
  Atom,
  Command,
  CoreEditor,
  EditorHistory,
  EditorType,
  FlexMode,
  KetMonomerClass,
  RenderersManager,
  Struct,
  Vec2,
  assert,
  fromNewCanvas,
  ketcherProvider,
} from 'ketcher-core';
import Editor from './Editor';
import {
  initKeydownListener,
  removeKeydownListener,
} from '../ui/state/hotkeys';

describe('History across molecule and macromolecule modes', () => {
  let micro: Editor;
  let macro: CoreEditor;
  let history: EditorHistory;
  const ketcherId = 'mode-history-test';
  const originalGetBBox = SVGElement.prototype.getBBox;
  const theme = {
    ketcher: {
      peptide: { color: {} },
      monomer: { color: { X: { regular: 'gray' } } },
    },
  };

  beforeEach(() => {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    });
    micro = new Editor(ketcherId, document as unknown as HTMLElement, {}, {});
    ketcherProvider.addKetcherInstance({
      id: ketcherId,
      editor: micro,
      changeEvent: { dispatch: jest.fn() },
    } as never);
    const canvas = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    canvas.innerHTML =
      '<defs><symbol id="peptide"><path class="monomer-body"/></symbol></defs><g class="drawn-structures"/>';
    Object.defineProperty(canvas, 'width', {
      configurable: true,
      value: { baseVal: { value: 800 } },
    });
    document.body.appendChild(canvas);
    macro = new CoreEditor({
      ketcherId,
      canvas,
      theme,
      mode: new FlexMode(),
      renderersContainer: new RenderersManager({
        theme: theme.ketcher as never,
      }),
    });
    history = EditorHistory.getInstance(macro);
    macro.events.switchToMacromoleculesMode.add(() =>
      macro.switchToMacromolecules(),
    );
    macro.events.switchToMoleculesMode.add(() =>
      macro.switchToMicromolecules(),
    );
  });

  afterEach(() => {
    macro.destroy();
    ketcherProvider.removeKetcherInstance(ketcherId);
    window.isPolymerEditorTurnedOn = false;
    document.body.innerHTML = '';
    if (originalGetBBox) {
      SVGElement.prototype.getBBox = originalGetBBox;
    } else {
      Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
    }
  });

  const addMicroStructure = () => {
    const struct = new Struct();
    const atom = new Atom({ label: 'C', pp: new Vec2(2, 3) });
    struct.atoms.add(atom);
    micro.update(fromNewCanvas(micro.render.ctab, struct));
    return micro.struct();
  };

  const addMonomer = () => {
    const monomerItem = macro.monomersLibrary.find(
      (item) => item.props?.MonomerClass === KetMonomerClass.AminoAcid,
    );
    assert(monomerItem);
    const command = macro.drawingEntitiesManager.addMonomer(
      monomerItem,
      new Vec2(100, 100),
    );
    macro.renderersContainer.update(command);
    history.update(command);
  };

  it('undoes and redoes edits and both mode switches in chronological order', () => {
    const originalStruct = addMicroStructure();
    const originalAtom = originalStruct.atoms.get(0);
    assert(originalAtom);
    const originalPosition = new Vec2(originalAtom.pp);
    macro.switchToMacromolecules();
    const originalManager = macro.drawingEntitiesManager;
    const convertedCount = originalManager.monomers.size;
    addMonomer();
    macro.switchToMicromolecules();
    const convertedStruct = micro.struct();
    expect(micro.historySize()).toEqual({ undo: 4, redo: 0 });

    micro.undo();
    expect(macro._type).toBe(EditorType.Macromolecules);
    expect(macro.drawingEntitiesManager).toBe(originalManager);
    expect(originalManager.monomers.size).toBe(convertedCount + 1);
    history.undo();
    expect(originalManager.monomers.size).toBe(convertedCount);
    history.undo();
    expect(macro._type).toBe(EditorType.Micromolecules);
    expect(micro.struct()).toBe(originalStruct);
    expect(micro.struct().atoms.get(0)?.pp).toEqual(originalPosition);
    micro.undo();
    expect(micro.struct().isBlank()).toBe(true);
    expect(micro.historySize()).toEqual({ undo: 0, redo: 4 });

    micro.redo();
    micro.redo();
    expect(macro._type).toBe(EditorType.Macromolecules);
    history.redo();
    expect(originalManager.monomers.size).toBe(convertedCount + 1);
    history.redo();
    expect(macro._type).toBe(EditorType.Micromolecules);
    expect(micro.struct()).toBe(convertedStruct);
    expect(micro.historySize()).toEqual({ undo: 4, redo: 0 });
  });

  it('discards the shared redo branch after a new edit or mode switch', () => {
    addMicroStructure();
    macro.switchToMacromolecules();
    addMonomer();
    history.undo();
    history.undo();
    expect(micro.historySize().redo).toBe(2);

    macro.switchToMacromolecules();
    expect(macro.drawingEntitiesManager.monomers.size).toBe(1);
    expect(micro.historySize()).toEqual({ undo: 2, redo: 0 });
    addMonomer();
    history.undo();
    addMonomer();
    expect(micro.historySize()).toEqual({ undo: 3, redo: 0 });
  });

  it.each([
    'flex-layout-mode',
    'snake-layout-mode',
    'sequence-layout-mode',
  ] as const)('restores %s and its commands without reconversion', (mode) => {
    macro.switchToMacromolecules();
    macro.events.selectMode.dispatch(mode);
    addMonomer();
    const originalManager = macro.drawingEntitiesManager;
    macro.switchToMicromolecules();
    addMicroStructure();
    micro.undo();
    micro.undo();

    expect(macro.mode.modeName).toBe(mode);
    expect(macro.drawingEntitiesManager).toBe(originalManager);
    expect(originalManager.monomers.size).toBe(1);
    history.undo();
    expect(originalManager.monomers.size).toBe(0);
    history.redo();
    expect(originalManager.monomers.size).toBe(1);
    history.redo();
    micro.redo();
    expect(macro._type).toBe(EditorType.Micromolecules);
    expect(micro.struct().atoms.size).toBe(1);
  });

  it('does not add history entries when selecting the current mode', () => {
    macro.switchToMicromolecules();
    expect(micro.historySize().undo).toBe(0);
    macro.switchToMacromolecules();
    macro.switchToMacromolecules();
    expect(micro.historySize().undo).toBe(1);
  });

  it('exports Flex positions when switching to molecules from Snake mode', () => {
    macro.switchToMacromolecules();
    macro.events.selectMode.dispatch('flex-layout-mode');
    addMonomer();
    const monomer = Array.from(
      macro.drawingEntitiesManager.monomers.values(),
    )[0];
    const flexPosition = new Vec2(monomer.position);

    macro.events.selectMode.dispatch('snake-layout-mode');
    expect(monomer.position).not.toEqual(flexPosition);

    macro.switchToMicromolecules();

    const [convertedMonomer] = Array.from(micro.struct().sgroups.values());
    expect(convertedMonomer?.pp).toEqual(monomer.position);
    expect(macro.mode.modeName).toBe('flex-layout-mode');
  });

  it.each(['undo', 'redo'] as const)(
    'handles a keyboard %s crossing into macro mode only once',
    (operation) => {
      addMicroStructure();
      macro.switchToMacromolecules();
      addMonomer();
      macro.switchToMicromolecules();
      if (operation === 'redo') {
        micro.undo();
        history.undo();
        history.undo();
      }
      const pointer = micro.historyPtr;
      const target = document.createElement('div');
      document.body.appendChild(target);
      initKeydownListener(target)(
        () => micro[operation](),
        () => ({
          editor: micro,
          actionState: { activeTool: {} },
          abbreviationLookup: { isOpen: false },
        }),
      );
      try {
        target.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'z',
            code: 'KeyZ',
            ctrlKey: true,
            shiftKey: operation === 'redo',
            bubbles: true,
            cancelable: true,
          }),
        );
        expect(macro._type).toBe(EditorType.Macromolecules);
        expect(micro.historyPtr).toBe(
          pointer + (operation === 'undo' ? -1 : 1),
        );
      } finally {
        removeKeydownListener(target)();
      }
    },
  );

  it('shares the 32-entry limit between both editors', () => {
    for (let index = 0; index < 20; index++) {
      macro.switchToMacromolecules();
      macro.switchToMicromolecules();
    }
    expect(micro.historySize()).toEqual({ undo: 32, redo: 0 });
    expect(history.historyPointer).toBe(32);
    expect(history.historyStack).toBe(micro.historyStack);
  });

  it('only merges consecutive macro commands, not mode transitions', () => {
    macro.switchToMacromolecules();
    addMonomer();
    const command = history.previousCommand;
    history.update(new Command(), true);
    expect(history.previousCommand).toBe(command);
    expect(micro.historySize().undo).toBe(2);
    macro.switchToMicromolecules();
    expect(history.previousCommand).toBeUndefined();
    expect(micro.historyStack.every((entry) => entry instanceof Action)).toBe(
      true,
    );
  });
});
