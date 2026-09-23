import { CoreEditor } from 'application/editor/Editor';
import { EditorHistory } from 'application/editor/EditorHistory';
import { EditorType } from 'application/editor/editor.types';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import {
  Atom,
  Command,
  Fragment,
  MonomerMicromolecule,
  Peptide,
  Struct,
  Vec2,
} from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { peptideMonomerItem } from '../../mock-data';

const createEditor = (modeName = 'flex-layout-mode') => {
  const editor = Object.create(CoreEditor.prototype) as CoreEditor;
  const struct = new Struct();
  const manager = new DrawingEntitiesManager();
  jest.spyOn(manager, 'clearCanvas').mockImplementation(() => undefined);
  Object.assign(editor, {
    _type: EditorType.Macromolecules,
    mode: { modeName, initialize: jest.fn() },
    drawingEntitiesManager: manager,
    micromoleculesEditor: {
      struct: () => struct,
      clear: jest.fn(),
      clearHistory: jest.fn(),
    },
    rescaleStructForModeTransition: jest.fn(() => 1),
    viewModel: { initialize: jest.fn() },
    renderersContainer: { update: jest.fn() },
    events: { modelChange: { dispatch: jest.fn() } },
  });
  return { editor, manager, struct };
};

describe('temporary monomer wizard mode session', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    EditorHistory.getInstance({} as CoreEditor).destroy();
  });

  it.each(['flex-layout-mode', 'snake-layout-mode', 'sequence-layout-mode'])(
    'discards without replacing canvas, history, or laying out %s',
    (modeName) => {
      const { editor, manager } = createEditor(modeName);
      const mode = editor.mode;
      const history = EditorHistory.getInstance(editor);
      history.historyStack = [new Command()];
      history.historyPointer = 1;
      const hidden = manager.micromoleculesHiddenEntities;

      editor.beginMonomerWizardSession();
      expect(editor._type).toBe(EditorType.Micromolecules);
      editor.switchToMicromolecules();
      editor.switchToMacromolecules();
      editor.finishMonomerWizardSession(false);

      expect(editor.mode).toBe(mode);
      expect(editor.drawingEntitiesManager).toBe(manager);
      expect(manager.micromoleculesHiddenEntities).toBe(hidden);
      expect(manager.clearCanvas).not.toHaveBeenCalled();
      expect(mode.initialize).not.toHaveBeenCalled();
      expect(EditorHistory.getInstance(editor)).toBe(history);
      expect(history.historyPointer).toBe(1);
      expect(editor._type).toBe(EditorType.Macromolecules);
    },
  );

  it.each(['flex-layout-mode', 'snake-layout-mode', 'sequence-layout-mode'])(
    'applies only the original structured layout after a canvas save in %s',
    (modeName) => {
      const { editor, manager } = createEditor(modeName);
      const snake = jest
        .spyOn(DrawingEntitiesManager.prototype, 'applySnakeLayout')
        .mockReturnValue(new Command());
      jest
        .spyOn(DrawingEntitiesManager.prototype, 'recalculateAntisenseChains')
        .mockReturnValue(new Command());
      jest
        .spyOn(MacromoleculesConverter, 'convertStructToDrawingEntities')
        .mockReturnValue({ modelChanges: new Command() } as never);

      editor.beginMonomerWizardSession();
      editor.finishMonomerWizardSession(true);

      expect(editor.mode.modeName).toBe(modeName);
      expect(editor.drawingEntitiesManager).not.toBe(manager);
      expect(snake).toHaveBeenCalledTimes(
        modeName === 'snake-layout-mode' ? 1 : 0,
      );
      expect(editor.mode.initialize).toHaveBeenCalledTimes(
        modeName === 'sequence-layout-mode' ? 1 : 0,
      );
      expect(editor.events.modelChange.dispatch).toHaveBeenCalledTimes(1);
      expect(editor.isMonomerWizardSessionActive).toBe(false);
    },
  );

  it('keeps the original canvas and exits the session if saved conversion fails', () => {
    const { editor, manager } = createEditor();
    editor.beginMonomerWizardSession();
    jest
      .spyOn(MacromoleculesConverter, 'convertStructToDrawingEntities')
      .mockImplementation(() => {
        throw new Error('Cannot convert');
      });

    expect(() => editor.finishMonomerWizardSession(true)).toThrow(
      'Cannot convert',
    );
    expect(editor.drawingEntitiesManager).toBe(manager);
    expect(manager.clearCanvas).not.toHaveBeenCalled();
    expect(editor._type).toBe(EditorType.Macromolecules);
    expect(editor.isMonomerWizardSessionActive).toBe(false);
  });

  it('does not convert the canvas for library editing or duplication', () => {
    const { editor, manager } = createEditor();
    const convert = jest.spyOn(
      MacromoleculesConverter,
      'convertDrawingEntitiesToStruct',
    );
    editor.beginMonomerWizardSession(false);
    editor.finishMonomerWizardSession(false);
    expect(convert).not.toHaveBeenCalled();
    expect(editor.drawingEntitiesManager).toBe(manager);
  });

  it('converts a detached monomer without consuming hidden entities or mutating its template', () => {
    const { editor, manager } = createEditor();
    const struct = new Struct();
    struct.atoms.set(
      7,
      new Atom({ label: 'C', pp: new Vec2(1, 2), stereoLabel: 'abs' }),
    );
    const fragment = new Fragment([7], new Vec2(5, 6));
    fragment.updateStereoFlag(struct);
    struct.frags.set(0, fragment);
    jest.spyOn(manager, 'getStereoFlagForMonomer').mockReturnValue({
      position: new Vec2(10, 20),
    } as never);
    const monomer = new Peptide(
      { ...peptideMonomerItem, struct, attachmentPoints: [] },
      new Vec2(12, 34),
    );
    manager.monomers.set(monomer.id, monomer);
    const hidden = manager.micromoleculesHiddenEntities;
    const result = editor.beginMonomerWizardSession();
    const sgroup = Array.from(
      result.struct.sgroups.values(),
    )[0] as MonomerMicromolecule;

    expect(result.monomerToAtomIdMap.get(monomer)?.has(7)).toBe(true);
    expect(sgroup.monomer).not.toBe(monomer);
    expect(sgroup.monomer.monomerItem.struct).not.toBe(struct);
    sgroup.setExpanded(true);
    expect(monomer.monomerItem.expanded).not.toBe(true);
    expect(manager.micromoleculesHiddenEntities).toBe(hidden);
    expect(monomer.position).toEqual(new Vec2(12, 34));
    expect(struct.atoms.get(7)?.pp).toEqual(new Vec2(1, 2));
    expect(fragment.stereoFlagPosition).toEqual(new Vec2(5, 6));
    expect(
      sgroup.monomer.monomerItem.struct.frags.get(0)?.stereoFlagPosition,
    ).toEqual(new Vec2(10, 20));
  });
});
