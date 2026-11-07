import {
  Action,
  Atom,
  AttachmentGroup,
  Bond,
  Command,
  CoreEditor,
  EditorHistory,
  EditorType,
  FlexMode,
  KetMonomerClass,
  MacromoleculesConverter,
  RenderersManager,
  StereoFlag,
  Struct,
  Vec2,
  assert,
  fromNewCanvas,
  ketcherProvider,
} from 'ketcher-core';
import Editor from './Editor';
import { Subscription } from 'subscription';
import {
  initKeydownListener,
  removeKeydownListener,
} from '../ui/state/hotkeys';

describe('History across molecule and macromolecule modes', () => {
  let micro: Editor;
  let macro: CoreEditor;
  let history: EditorHistory;
  const ketcherId = 'mode-history-test';
  const originalGetBBox = Reflect.get(SVGElement.prototype, 'getBBox');
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
      changeEvent: new Subscription(),
      updateMonomersLibrary: jest.fn(),
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
    jest.restoreAllMocks();
    jest.useRealTimers();
    macro.destroy();
    ketcherProvider.removeKetcherInstance(ketcherId);
    globalThis.isPolymerEditorTurnedOn = false;
    document.body.innerHTML = '';
    if (originalGetBBox) {
      Reflect.set(SVGElement.prototype, 'getBBox', originalGetBBox);
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

  it('keeps a monomer wizard canvas save undoable', () => {
    addMicroStructure();
    macro.switchToMacromolecules();
    const originalManager = macro.drawingEntitiesManager;
    expect(originalManager.atoms.size).toBe(1);
    const previousHistoryPointer = history.historyPointer;
    jest
      .spyOn(MacromoleculesConverter, 'convertStructToDrawingEntities')
      .mockReturnValue({ modelChanges: new Command() } as never);

    macro.beginMonomerWizardSession();
    macro.finishMonomerWizardSession(true);

    expect(history.historyPointer).toBe(previousHistoryPointer + 1);
    history.undo();
    expect(macro.drawingEntitiesManager).toBe(originalManager);
    expect(originalManager.atoms.size).toBe(1);
    expect(history.historyPointer).toBe(previousHistoryPointer);
    history.redo();
    expect(macro.drawingEntitiesManager).not.toBe(originalManager);
    expect(history.historyPointer).toBe(previousHistoryPointer + 1);
  });

  it.each([
    { partialSelection: false, withAttachmentGroup: false },
    { partialSelection: true, withAttachmentGroup: false },
    { partialSelection: false, withAttachmentGroup: true },
    { partialSelection: true, withAttachmentGroup: true },
  ])(
    'undoes a saved molecule monomer (partial selection: $partialSelection, attachment group: $withAttachmentGroup)',
    ({ partialSelection, withAttachmentGroup }) => {
      jest.useFakeTimers();
      const struct = new Struct();
      for (let index = 0; index < 12; index++) {
        struct.atoms.add(
          new Atom({ label: 'C', pp: new Vec2(index, index % 2) }),
        );
        if (index > 0) {
          struct.bonds.add(new Bond({ begin: index - 1, end: index, type: 1 }));
        }
      }
      if (withAttachmentGroup) {
        const memberAtomIds = [0, 1].map((index) =>
          struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(index, 5) })),
        );
        const metalAtomId = struct.atoms.add(
          new Atom({ label: 'Fe', pp: new Vec2(0, 7) }),
        );
        const groupId = struct.addAttachmentGroup(
          new AttachmentGroup({ atomIds: memberAtomIds }),
        );
        struct.bonds.add(
          new Bond({
            begin: groupId,
            end: metalAtomId,
            type: Bond.PATTERN.TYPE.HAPTIC,
          }),
        );
      }
      const expectAttachmentGroupPreserved = () => {
        const current = micro.struct();
        expect(current.attachmentGroups.size).toBe(withAttachmentGroup ? 1 : 0);
        if (!withAttachmentGroup) return;
        const [groupId, group] = Array.from(
          current.attachmentGroups.entries(),
        )[0];
        expect(group.atomIds).toHaveLength(2);
        expect(
          group.atomIds.map((atomId) => current.atoms.get(atomId)?.pp),
        ).toEqual([new Vec2(0, 5), new Vec2(1, 5)]);
        const hapticBonds = Array.from(current.bonds.values()).filter(
          (bond) => bond.type === Bond.PATTERN.TYPE.HAPTIC,
        );
        expect(hapticBonds).toHaveLength(1);
        expect(hapticBonds[0].begin).toBe(groupId);
        expect(current.atoms.get(hapticBonds[0].end)?.label).toBe('Fe');
      };
      micro.update(fromNewCanvas(micro.render.ctab, struct));
      const originalStruct = micro.struct();
      const positions = Array.from(
        originalStruct.atoms.values(),
        (atom) => new Vec2(atom.pp),
      );
      if (partialSelection) {
        micro.selection({ atoms: [0, 1, 2, 3], bonds: [0, 1, 2] });
      } else if (withAttachmentGroup) {
        micro.selection({
          atoms: Array.from({ length: 12 }, (_, index) => index),
          bonds: Array.from({ length: 11 }, (_, index) => index),
        });
      }
      expect(micro.isMonomerCreationWizardEnabled).toBe(true);
      micro.openMonomerCreationWizard();
      if (!partialSelection) {
        micro.assignLeavingGroupAtom(11);
      }
      const wizardStruct = micro.struct();
      const atomIdMap = new Map<number, number>();
      const structure = wizardStruct.clone(
        undefined,
        undefined,
        undefined,
        atomIdMap,
      );
      const monomerCreationState = micro.monomerCreationState;
      assert(monomerCreationState);
      const monomerData = micro.saveNewMonomer({
        type: KetMonomerClass.CHEM,
        symbol: 'UndoTest',
        name: 'Undo test monomer',
        naturalAnalogue: '',
        aliasHELM: '',
        aliasBILN: '',
        structure,
        attachmentPoints: monomerCreationState.assignedAttachmentPoints,
      });
      micro.finishNewMonomersCreation([
        {
          ...monomerData,
          atomIdMap,
          monomerStructureInWizard: {
            atoms: Array.from(wizardStruct.atoms.keys()),
            bonds: Array.from(wizardStruct.bonds.keys()),
          },
        },
      ]);
      jest.runAllTimers();

      expect(micro.historySize()).toEqual({ undo: 2, redo: 0 });
      expect(micro.struct().sgroups.size).toBe(1);
      expect(micro.struct().bonds.size).toBe(
        (partialSelection ? 12 : 11) + (withAttachmentGroup ? 1 : 0),
      );
      expectAttachmentGroupPreserved();
      micro.struct().bonds.forEach((bond) => {
        expect(micro.struct().getBondEndpoint(bond.begin)).toBeDefined();
        expect(micro.struct().getBondEndpoint(bond.end)).toBeDefined();
      });
      expect(originalStruct.sgroups.size).toBe(0);
      const savedStruct = micro.struct();
      micro.undo();
      expect(micro.struct()).toBe(originalStruct);
      expect(micro.struct().sgroups.size).toBe(0);
      expect(micro.struct().atoms.size).toBe(withAttachmentGroup ? 15 : 12);
      expectAttachmentGroupPreserved();
      expect(
        Array.from(micro.struct().atoms.values(), (atom) => atom.pp),
      ).toEqual(positions);
      micro.redo();
      expect(micro.struct()).toBe(savedStruct);
      expect(micro.struct().sgroups.size).toBe(1);
      expectAttachmentGroupPreserved();
      micro.undo();
      micro.undo();
      expect(micro.struct().isBlank()).toBe(true);
      micro.redo();
      micro.redo();
      expect(micro.struct()).toBe(savedStruct);
      expectAttachmentGroupPreserved();
    },
  );

  it('preserves ABS after saving a monomer connected to a stereocenter', () => {
    jest.useFakeTimers();
    const struct = new Struct();
    ['N', 'C', 'N', 'C', 'C', 'N', 'C', 'N', 'C', 'C', 'C', 'C', 'C'].forEach(
      (label, index) => {
        struct.atoms.add(new Atom({ label, pp: new Vec2(index, index % 2) }));
      },
    );
    [
      [0, 1, 0],
      [0, 2, Bond.PATTERN.STEREO.UP],
      [2, 3, 0],
      [2, 4, Bond.PATTERN.STEREO.UP],
      [4, 5, Bond.PATTERN.STEREO.UP],
      [5, 6, 0],
      [5, 7, Bond.PATTERN.STEREO.UP],
      [7, 8, 0],
      [7, 9, Bond.PATTERN.STEREO.UP],
      [9, 10, Bond.PATTERN.STEREO.UP],
      [0, 11, Bond.PATTERN.STEREO.UP],
      [11, 12, Bond.PATTERN.STEREO.UP],
    ].forEach(([begin, end, stereo]) => {
      struct.bonds.add(new Bond({ begin, end, stereo, type: 1 }));
    });
    struct.initHalfBonds();
    struct.initNeighbors();
    // Import can assign atom stereo labels after fragments have been built.
    struct.markFragments();
    struct.setStereoLabelsToAtoms();
    micro.update(fromNewCanvas(micro.render.ctab, struct));
    const expectAbs = () => {
      const absoluteFragments = Array.from(
        micro.struct().frags.entries(),
      ).filter(
        ([, fragment]) => fragment?.enhancedStereoFlag === StereoFlag.Abs,
      );
      expect(absoluteFragments.length).toBeGreaterThan(0);
      absoluteFragments.forEach(([fragmentId]) => {
        expect(micro.render.ctab.enhancedFlags.has(fragmentId)).toBe(true);
      });
    };
    micro.selection({ atoms: [10, 9, 8, 7], bonds: [9, 8, 7] });
    expect(micro.isMonomerCreationWizardEnabled).toBe(true);
    micro.openMonomerCreationWizard();
    const wizardStruct = micro.struct();
    const atomIdMap = new Map<number, number>();
    const structure = wizardStruct.clone(
      undefined,
      undefined,
      undefined,
      atomIdMap,
    );
    const state = micro.monomerCreationState;
    assert(state);
    const monomerData = micro.saveNewMonomer({
      type: KetMonomerClass.CHEM,
      symbol: 'StereoTest',
      name: 'Stereo test monomer',
      naturalAnalogue: '',
      aliasHELM: '',
      aliasBILN: '',
      structure,
      attachmentPoints: state.assignedAttachmentPoints,
    });
    micro.finishNewMonomersCreation([
      {
        ...monomerData,
        atomIdMap,
        monomerStructureInWizard: {
          atoms: Array.from(wizardStruct.atoms.keys()),
          bonds: Array.from(wizardStruct.bonds.keys()),
        },
      },
    ]);
    jest.runAllTimers();
    expect(micro.struct().sgroups.size).toBe(1);
    expectAbs();
    micro.undo();
    expect(micro.struct()).toBe(struct);
    micro.redo();
    expectAbs();
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
