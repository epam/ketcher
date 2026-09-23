import {
  Atom,
  AtomLabel,
  AttachmentPointName,
  Bond,
  CoreAtom,
  FunctionalGroup,
  KetMonomerClass,
  MacromoleculesConverter,
  MonomerMicromolecule,
  Peptide,
  provideEditorInstance,
  SGroup,
  Struct,
  Vec2,
  type BaseMonomer,
} from 'ketcher-core';
import { Subscription } from 'subscription';
import Editor from './Editor';

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  provideEditorInstance: jest.fn(),
}));

const makeMonomer = () => {
  const struct = new Struct();
  struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  struct.atoms.add(new Atom({ label: 'O', pp: new Vec2(1, 0) }));
  struct.bonds.add(new Bond({ begin: 0, end: 1, type: 1 }));
  return new Peptide({
    label: 'A',
    props: {
      Name: 'Alanine',
      MonomerName: 'A',
      MonomerFullName: 'Alanine',
      MonomerNaturalAnalogCode: 'A',
      MonomerClass: KetMonomerClass.AminoAcid,
    },
    struct,
    attachmentPoints: [
      {
        attachmentAtom: 0,
        leavingGroup: { atoms: [1] },
        label: 'R1',
      },
    ],
  });
};

const createEditor = (struct = new Struct()) => {
  const editor = Object.create(Editor.prototype) as Editor;
  Object.assign(editor, {
    ketcherId: 'wizard-test',
    render: { ctab: { molecule: struct }, monomerCreationState: null },
    event: { monomerWizardStateChange: new Subscription<boolean>() },
    struct: jest.fn((value?: Struct) => value ?? struct),
    selection: jest.fn(),
    tool: jest.fn(),
    unsubscribeFromChangeEventInMonomerCreationWizard: jest.fn(),
    openMonomerCreationWizard: jest.fn(),
    errorHandler: jest.fn(),
  });
  return editor;
};

describe('macro monomer wizard bridge', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it.each(['library', 'duplicate'] as const)(
    'opens %s from a detached library structure and never replaces the canvas',
    (mode) => {
      const monomer = makeMonomer();
      const editor = createEditor();
      const begin = jest.fn(() => ({
        struct: new Struct(),
        monomerToAtomIdMap: new Map(),
      }));
      (provideEditorInstance as jest.Mock).mockReturnValue({
        drawingEntitiesManager: { selectedEntities: [] },
        beginMonomerWizardSession: begin,
      });
      const finish = jest.fn();
      editor.openMonomerCreationWizardFromMacro(
        { mode, libraryItem: monomer.monomerItem },
        finish,
      );

      expect(begin).toHaveBeenCalledWith(false);
      expect(editor.openMonomerCreationWizard).toHaveBeenCalledWith(
        { atoms: [0, 1], bonds: [0] },
        expect.objectContaining({
          libraryOnly: true,
          symbol: mode === 'library' ? 'A' : 'A_Copy',
        }),
        expect.arrayContaining([
          expect.objectContaining({ atomId: 0, leaveAtomId: 1 }),
        ]),
        expect.any(Peptide),
      );
      expect((editor.struct as jest.Mock).mock.calls[0][0]).not.toBe(
        monomer.monomerItem.struct,
      );
      Reflect.get(editor, 'completeMonomerWizardSession').call(editor, true);
      expect(finish).toHaveBeenCalledWith(false);
    },
  );

  it.each(['instance', 'all'] as const)(
    'opens %s with the clicked monomer structure and attachment points',
    (mode) => {
      const monomer = makeMonomer();
      const struct = new Struct();
      const sg = MacromoleculesConverter.convertMonomerToMonomerMicromolecule(
        monomer,
        struct,
      );
      sg.atoms = [3, 4];
      sg.pp = new Vec2(12, 34);
      sg.addAttachmentPoints(
        MacromoleculesConverter.convertMonomerAttachmentPointsToSGroupAttachmentPoints(
          monomer,
          new Map([
            [0, 3],
            [1, 4],
          ]),
        ),
        false,
      );
      const editor = createEditor(struct);
      (provideEditorInstance as jest.Mock).mockReturnValue({
        drawingEntitiesManager: { selectedEntities: [] },
        beginMonomerWizardSession: () => ({
          struct,
          monomerToAtomIdMap: new Map([
            [
              monomer,
              new Map([
                [0, 3],
                [1, 4],
              ]),
            ],
          ]),
        }),
      });

      editor.openMonomerCreationWizardFromMacro({ mode, monomer }, jest.fn());

      expect(editor.openMonomerCreationWizard).toHaveBeenCalledWith(
        { atoms: [3, 4], bonds: [] },
        expect.objectContaining({
          editMode: mode,
          originalType: KetMonomerClass.AminoAcid,
          originalSymbol: 'A',
          position: sg.pp,
        }),
        sg.getAttachmentPoints(),
        sg.monomer,
      );
    },
  );

  it.each([1, 2])(
    'preserves the Edit All scope for %s selected matching monomers',
    (selectedCount) => {
      const monomers = [makeMonomer(), makeMonomer(), makeMonomer()];
      const struct = new Struct();
      const monomerToAtomIdMap = new Map<BaseMonomer, Map<number, number>>();
      monomers.forEach((monomer, index) => {
        const group =
          MacromoleculesConverter.convertMonomerToMonomerMicromolecule(
            monomer,
            struct,
          );
        const atomIds = [index * 2, index * 2 + 1];
        group.atoms = atomIds;
        struct.functionalGroups.add(new FunctionalGroup(group));
        monomerToAtomIdMap.set(
          monomer,
          new Map(atomIds.map((id, localId) => [localId, id])),
        );
      });
      const editor = createEditor(struct);
      (provideEditorInstance as jest.Mock).mockReturnValue({
        drawingEntitiesManager: {
          selectedEntities: monomers
            .slice(0, selectedCount)
            .map((monomer, index) => [index, monomer]),
        },
        beginMonomerWizardSession: () => ({ struct, monomerToAtomIdMap }),
      });

      editor.openMonomerCreationWizardFromMacro(
        { mode: 'all', monomer: monomers[0] },
        jest.fn(),
      );

      expect(
        (editor.openMonomerCreationWizard as jest.Mock).mock.calls[0][1],
      ).toEqual(
        expect.objectContaining({
          selectedSGroupIds: selectedCount > 1 ? [0, 1] : undefined,
        }),
      );
    },
  );

  it.each(['monomer', 'atom'])(
    'creates from the entire selection including the second %s',
    (entityType) => {
      const monomer = makeMonomer();
      const molecule = makeMonomer();
      const atom = new CoreAtom(new Vec2(), molecule, 0, AtomLabel.C);
      const struct = new Struct();
      const editor = createEditor(struct);
      Object.defineProperty(editor, 'isMonomerCreationWizardEnabled', {
        value: true,
      });
      (provideEditorInstance as jest.Mock).mockReturnValue({
        drawingEntitiesManager: {
          selectedEntities: [
            [0, monomer],
            [1, entityType === 'atom' ? atom : molecule],
          ],
        },
        beginMonomerWizardSession: () => ({
          struct,
          monomerToAtomIdMap: new Map([
            [
              monomer,
              new Map([
                [0, 3],
                [1, 4],
              ]),
            ],
            [molecule, new Map([[0, 9]])],
          ]),
        }),
      });

      editor.openMonomerCreationWizardFromMacro({ mode: 'create' }, jest.fn());

      expect(editor.openMonomerCreationWizard).toHaveBeenCalledWith({
        atoms: [3, 4, 9],
        bonds: [],
      });
    },
  );

  it('strips monomer metadata and bonded leaving groups but retains internal and boundary bonds', () => {
    const monomer = makeMonomer();
    const struct = monomer.monomerItem.struct.clone();
    struct.atoms.add(new Atom({ label: 'N' }));
    struct.atoms.add(new Atom({ label: 'C' }));
    struct.bonds.add(new Bond({ begin: 0, end: 2, type: 1 }));
    struct.bonds.add(new Bond({ begin: 2, end: 3, type: 1 }));
    const group = new MonomerMicromolecule(SGroup.TYPES.SUP, monomer);
    const id = struct.sgroups.add(group);
    group.id = id;
    struct.atomAddToSGroup(id, 0);
    struct.atomAddToSGroup(id, 1);
    jest.spyOn(monomer, 'isAttachmentPointUsed').mockReturnValue(true);
    const selected = new Set([0, 1, 2]);
    const editor = createEditor();
    const prepare = Reflect.get(editor, 'prepareMacroMonomersForCreation') as (
      struct: Struct,
      selected: Set<number>,
      mapping: Map<BaseMonomer, Map<number, number>>,
    ) => void;

    prepare.call(
      editor,
      struct,
      selected,
      new Map([
        [
          monomer,
          new Map([
            [0, 0],
            [1, 1],
          ]),
        ],
      ]),
    );

    expect(selected).toEqual(new Set([0, 2]));
    expect(struct.sgroups.size).toBe(0);
    expect(struct.atoms.has(1)).toBe(false);
    expect(struct.atoms.get(0)?.sgs.size).toBe(0);
    expect(
      Array.from(struct.bonds.values()).map(({ begin, end }) => [begin, end]),
    ).toEqual([
      [0, 2],
      [2, 3],
    ]);
  });

  it('restores on discard and not before the deferred save merge completes', () => {
    jest.useFakeTimers();
    const editor = createEditor();
    const finish = jest.fn();
    Reflect.set(editor, 'onMonomerWizardFinish', finish);
    Reflect.set(editor.render, 'monomerCreationState', {
      assignedAttachmentPoints: new Map([[AttachmentPointName.R1, [0, 1]]]),
    });
    editor.closeMonomerCreationWizard(false, false);
    expect(finish).not.toHaveBeenCalled();
    const merge = jest.fn(() => expect(finish).not.toHaveBeenCalled());
    Reflect.get(editor, 'finishMonomerWizardAfterMerge').call(editor, merge);
    expect(merge).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(merge).toHaveBeenCalledTimes(1);
    expect(finish).toHaveBeenCalledWith(true);

    Reflect.set(editor, 'onMonomerWizardFinish', finish);
    Reflect.set(editor.render, 'monomerCreationState', {});
    editor.closeMonomerCreationWizard(true);
    expect(finish).toHaveBeenLastCalledWith(false);
  });

  it('restores the original macro canvas if opening or deferred merge fails', () => {
    jest.useFakeTimers();
    const editor = createEditor();
    const finish = jest.fn();
    (provideEditorInstance as jest.Mock).mockReturnValue({
      drawingEntitiesManager: { selectedEntities: [] },
      beginMonomerWizardSession: () => ({
        struct: new Struct(),
        monomerToAtomIdMap: new Map(),
      }),
    });
    expect(() =>
      editor.openMonomerCreationWizardFromMacro({ mode: 'create' }, finish),
    ).toThrow('Select a structure');
    expect(finish).toHaveBeenCalledWith(false);

    Reflect.set(editor, 'onMonomerWizardFinish', finish);
    Reflect.get(editor, 'finishMonomerWizardAfterMerge').call(editor, () => {
      throw new Error('Merge failed');
    });
    jest.runOnlyPendingTimers();
    expect(finish).toHaveBeenLastCalledWith(false);
    expect(editor.errorHandler).toHaveBeenCalledWith('Merge failed');
  });
});
