import {
  Atom,
  Bond,
  FunctionalGroupsProvider,
  MonomerMicromolecule,
  SaltsAndSolventsProvider,
  SGroup,
  Struct,
  Vec2,
  fromMultipleMove,
  fromNewCanvas,
  getItemsToFuse,
} from 'ketcher-core';
import Editor from '../../Editor';
import { createCopyOfSelected } from '../../../ui/action/createCopyOfSelected';
import { dropAndMerge } from '../helper/dropAndMerge';
import SelectTool from './select';

jest.mock('../helper/dropAndMerge');

const ketcherId = 'select-mouseup-test';

const createLibraryEntry = (name: string) =>
  Object.assign(new Struct(), { name, abbreviation: name });

type TargetGroupOptions = {
  type: string;
  name?: string;
  expanded: boolean;
};

const createSuperatom = (name: string | undefined, expanded: boolean) => {
  const sgroup = new SGroup('SUP');
  if (name) sgroup.data.name = name;
  sgroup.data.expanded = expanded;
  return sgroup;
};

const addSGroup = (struct: Struct, sgroup: SGroup, atomIds: number[]) => {
  const groupId = struct.sgroups.add(sgroup);
  sgroup.id = groupId;
  atomIds.forEach((atomId) => struct.atomAddToSGroup(groupId, atomId));
  return groupId;
};

const addBond = (struct: Struct, begin: number, end: number) =>
  struct.bonds.add(new Bond({ begin, end, type: Bond.PATTERN.TYPE.SINGLE }));

describe('SelectTool mouseup', () => {
  let editor: Editor;
  let onRemoveFG: jest.Mock;

  beforeEach(() => {
    editor = new Editor(ketcherId, document as unknown as HTMLElement, {}, {});
    onRemoveFG = jest.fn();
    editor.event.removeFG.add(onRemoveFG);
    FunctionalGroupsProvider.getInstance().setFunctionalGroupsList([
      createLibraryEntry('Boc'),
    ]);
    SaltsAndSolventsProvider.getInstance().setSaltsAndSolventsList([
      createLibraryEntry('Sodium chloride'),
    ]);
  });

  afterEach(() => {
    FunctionalGroupsProvider.getInstance().setFunctionalGroupsList([]);
    SaltsAndSolventsProvider.getInstance().setSaltsAndSolventsList([]);
    jest.clearAllMocks();
  });

  const drawStructure = (group: TargetGroupOptions | null) => {
    const struct = new Struct();
    const srcAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const targetAtomId = struct.atoms.add(
      new Atom({ label: 'N', pp: new Vec2(3, 0) }),
    );
    let groupId: number | undefined;
    if (group) {
      // Shifts the group's sgroup id away from its functional-group pool id.
      struct.sgroups.add(new SGroup('SRU'));
      const sgroup = new SGroup(group.type);
      if (group.name) sgroup.data.name = group.name;
      sgroup.data.expanded = group.expanded;
      groupId = struct.sgroups.add(sgroup);
      sgroup.id = groupId;
      struct.atomAddToSGroup(groupId, targetAtomId);
    }
    struct.bindSGroupsToFunctionalGroups();
    editor.update(fromNewCanvas(editor.render.ctab, struct), true);

    return { srcAtomId, targetAtomId, groupId };
  };

  const runMouseup = (dragCtx: object) => {
    const tool = new SelectTool(editor, 'rectangle');
    tool.isMouseDown = true;
    Reflect.set(tool, 'dragCtx', dragCtx);
    tool.mouseup(new MouseEvent('mouseup') as PointerEvent);
    return tool;
  };

  const mouseupWithDragContext = (mergeItems: object) =>
    runMouseup({
      item: { map: 'atoms', id: 0 },
      xy0: new Vec2(),
      action: null,
      mergeItems,
    });

  const dropAtomOnto = (srcAtomId: number, targetAtomId: number) =>
    mouseupWithDragContext({
      atoms: new Map([[srcAtomId, targetAtomId]]),
      bonds: new Map(),
    });

  it.each([
    ['functional group', { type: 'SUP', name: 'Boc', expanded: true }],
    ['salt', { type: 'SUP', name: 'Sodium chloride', expanded: true }],
    ['custom superatom', { type: 'SUP', name: 'CustomLabel', expanded: true }],
  ])(
    'opens Edit Abbreviation instead of merging when an atom is dropped onto an expanded %s',
    (_, group) => {
      const { srcAtomId, targetAtomId, groupId } = drawStructure(group);

      dropAtomOnto(srcAtomId, targetAtomId);

      expect(onRemoveFG).toHaveBeenCalledWith({ fgIds: [groupId] });
      expect(dropAndMerge).not.toHaveBeenCalled();
    },
  );

  it.each(['SRU', 'MUL', 'DAT'])(
    'merges as before when an atom is dropped onto a %s group',
    (type) => {
      const { srcAtomId, targetAtomId } = drawStructure({
        type,
        expanded: true,
      });

      dropAtomOnto(srcAtomId, targetAtomId);

      expect(onRemoveFG).not.toHaveBeenCalled();
      expect(dropAndMerge).toHaveBeenCalledTimes(1);
    },
  );

  it('merges as before when an atom is dropped onto a plain atom', () => {
    const { srcAtomId, targetAtomId } = drawStructure(null);

    dropAtomOnto(srcAtomId, targetAtomId);

    expect(onRemoveFG).not.toHaveBeenCalled();
    expect(dropAndMerge).toHaveBeenCalledTimes(1);
  });

  it('keeps replacing a collapsed functional group', () => {
    const { srcAtomId, groupId } = drawStructure({
      type: 'SUP',
      name: 'Boc',
      expanded: false,
    });

    mouseupWithDragContext({
      atoms: new Map(),
      bonds: new Map(),
      atomToFunctionalGroup: new Map([[srcAtomId, groupId]]),
    });

    expect(onRemoveFG).not.toHaveBeenCalled();
    expect(dropAndMerge).toHaveBeenCalledTimes(1);
  });

  it('opens Edit Abbreviation when a bond is dropped onto a bond inside an expanded functional group', () => {
    const struct = new Struct();
    struct.sgroups.add(new SGroup('SRU'));
    const fgAtomA = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const fgAtomB = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const fgBondId = addBond(struct, fgAtomA, fgAtomB);
    const srcAtomA = struct.atoms.add(
      new Atom({ label: 'N', pp: new Vec2(6, 0) }),
    );
    const srcAtomB = struct.atoms.add(
      new Atom({ label: 'N', pp: new Vec2(7, 0) }),
    );
    const srcBondId = addBond(struct, srcAtomA, srcAtomB);
    const groupId = addSGroup(struct, createSuperatom('Boc', true), [
      fgAtomA,
      fgAtomB,
    ]);
    struct.bindSGroupsToFunctionalGroups();
    editor.update(fromNewCanvas(editor.render.ctab, struct), true);

    mouseupWithDragContext({
      atoms: new Map(),
      bonds: new Map([[srcBondId, fgBondId]]),
    });

    expect(onRemoveFG).toHaveBeenCalledWith({ fgIds: [groupId] });
    expect(dropAndMerge).not.toHaveBeenCalled();
  });

  describe('with real drag operations', () => {
    let rerender: jest.SpyInstance;

    beforeEach(() => {
      rerender = jest.spyOn(editor.rotateController, 'rerender');
    });

    const drawScene = (sourceSgroup: SGroup | null = null) => {
      const struct = new Struct();
      // Shifts sgroup ids away from functional-group pool ids.
      struct.sgroups.add(new SGroup('SRU'));
      const [fgAtomA, fgAtomB, monomerAtom, srcAtomA, srcAtomB] = [
        [0, 0],
        [1, 0],
        [3, 0],
        [6, 0],
        [7, 0],
      ].map(([x, y]) =>
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, y) })),
      );
      const fgBondId = addBond(struct, fgAtomA, fgAtomB);
      const srcBondId = addBond(struct, srcAtomA, srcAtomB);
      const fgId = addSGroup(struct, createSuperatom('Boc', true), [
        fgAtomA,
        fgAtomB,
      ]);
      const monomer = new MonomerMicromolecule('SUP', {
        monomerItem: { label: 'A', expanded: true },
      } as never);
      monomer.data.name = 'A';
      const monomerId = addSGroup(struct, monomer, [monomerAtom]);
      if (sourceSgroup) addSGroup(struct, sourceSgroup, [srcAtomA, srcAtomB]);
      struct.bindSGroupsToFunctionalGroups();
      editor.update(fromNewCanvas(editor.render.ctab, struct), true);

      return {
        fgId,
        fgBondId,
        monomerId,
        fgAtomA,
        fgAtomB,
        monomerAtom,
        srcAtomA,
        srcAtomB,
        srcBondId,
      };
    };

    const positionOf = (atomId: number) =>
      new Vec2(editor.render.ctab.molecule.atoms.get(atomId)!.pp);

    const moveSelectionTo = (atomId: number, target: Vec2) => {
      const action = fromMultipleMove(
        editor.render.ctab,
        editor.explicitSelected(),
        target.sub(positionOf(atomId)),
      );
      editor.update(action, true);
      return action;
    };

    it('cancels a Ctrl+drag copy of a bonded structure dropped onto an expanded functional group', () => {
      const scene = drawScene();
      const { molecule } = editor.render.ctab;
      const atomCount = molecule.atoms.size;
      const bondCount = molecule.bonds.size;
      const historyPtr = editor.historyPtr;
      const srcPos = positionOf(scene.srcAtomA);

      editor.selection({
        atoms: [scene.srcAtomA, scene.srcAtomB],
        bonds: [scene.srcBondId],
      });
      const { action: copyAction, items } = createCopyOfSelected(
        editor,
        srcPos,
      );
      editor.selection(items);
      const copyAtomId = items.atoms![0];
      const action = moveSelectionTo(copyAtomId, positionOf(scene.fgAtomB));
      const mergeItems = getItemsToFuse(editor, editor.explicitSelected());

      const tool = runMouseup({
        item: { map: 'atoms', id: copyAtomId },
        xy0: new Vec2(),
        action,
        copyAction,
        mergeItems,
      });

      expect(onRemoveFG).toHaveBeenCalledWith({ fgIds: [scene.fgId] });
      expect(dropAndMerge).not.toHaveBeenCalled();
      expect(molecule.atoms.get(copyAtomId)).toBeUndefined();
      expect(molecule.atoms.size).toBe(atomCount);
      expect(molecule.bonds.size).toBe(bondCount);
      expect(positionOf(scene.srcAtomA)).toEqual(srcPos);
      expect(editor.historyPtr).toBe(historyPtr);
      expect(editor.selection()).toBeNull();
      expect(Reflect.get(tool, 'dragCtx')).toBeNull();
      expect(rerender).toHaveBeenCalledTimes(1);
    });

    it('restores a dragged atom and adds no history entry when it is dropped onto an expanded functional group', () => {
      const scene = drawScene();
      const historyPtr = editor.historyPtr;
      const srcPos = positionOf(scene.srcAtomA);

      editor.selection({ atoms: [scene.srcAtomA] });
      const action = moveSelectionTo(scene.srcAtomA, positionOf(scene.fgAtomB));
      const mergeItems = getItemsToFuse(editor, editor.explicitSelected());

      runMouseup({
        item: { map: 'atoms', id: scene.srcAtomA },
        xy0: new Vec2(),
        action,
        mergeItems,
      });

      expect(onRemoveFG).toHaveBeenCalledWith({ fgIds: [scene.fgId] });
      expect(dropAndMerge).not.toHaveBeenCalled();
      expect(positionOf(scene.srcAtomA)).toEqual(srcPos);
      expect(editor.historyPtr).toBe(historyPtr);
      expect(editor.selection()).toBeNull();
      expect(rerender).toHaveBeenCalledTimes(1);
    });

    it('restores a dragged bond and opens Edit Abbreviation when it is dropped onto the functional group', () => {
      const scene = drawScene();
      const historyPtr = editor.historyPtr;
      const srcPosA = positionOf(scene.srcAtomA);
      const srcPosB = positionOf(scene.srcAtomB);

      editor.selection({
        atoms: [scene.srcAtomA, scene.srcAtomB],
        bonds: [scene.srcBondId],
      });
      const action = moveSelectionTo(scene.srcAtomA, positionOf(scene.fgAtomA));
      const mergeItems = getItemsToFuse(editor, editor.explicitSelected());

      runMouseup({
        item: { map: 'bonds', id: scene.srcBondId },
        xy0: new Vec2(),
        action,
        mergeItems,
      });

      expect(onRemoveFG).toHaveBeenCalledWith({ fgIds: [scene.fgId] });
      expect(dropAndMerge).not.toHaveBeenCalled();
      expect(positionOf(scene.srcAtomA)).toEqual(srcPosA);
      expect(positionOf(scene.srcAtomB)).toEqual(srcPosB);
      expect(editor.historyPtr).toBe(historyPtr);
      expect(editor.selection()).toBeNull();
    });

    it('dispatches a single removal for several atoms of the same functional group', () => {
      const scene = drawScene();

      mouseupWithDragContext({
        atoms: new Map([
          [scene.srcAtomA, scene.fgAtomA],
          [scene.srcAtomB, scene.fgAtomB],
        ]),
        bonds: new Map(),
      });

      expect(onRemoveFG).toHaveBeenCalledTimes(1);
      expect(onRemoveFG).toHaveBeenCalledWith({ fgIds: [scene.fgId] });
      expect(dropAndMerge).not.toHaveBeenCalled();
    });

    it('excludes monomer targets from the functional groups to open', () => {
      const scene = drawScene();

      mouseupWithDragContext({
        atoms: new Map([
          [scene.srcAtomA, scene.fgAtomA],
          [scene.srcAtomB, scene.monomerAtom],
        ]),
        bonds: new Map(),
      });

      expect(onRemoveFG).toHaveBeenCalledTimes(1);
      expect(onRemoveFG).toHaveBeenCalledWith({ fgIds: [scene.fgId] });
      expect(dropAndMerge).not.toHaveBeenCalled();
    });

    it('merges as before when the only target is a monomer', () => {
      const scene = drawScene();

      dropAtomOnto(scene.srcAtomA, scene.monomerAtom);

      expect(onRemoveFG).not.toHaveBeenCalled();
      expect(dropAndMerge).toHaveBeenCalledTimes(1);
    });

    it('opens Edit Abbreviation for a plain atom that belongs to a label-less superatom', () => {
      const scene = drawScene(createSuperatom(undefined, true));
      editor.selection({
        atoms: [scene.srcAtomA, scene.srcAtomB],
        bonds: [scene.srcBondId],
      });

      dropAtomOnto(scene.srcAtomA, scene.fgAtomB);

      expect(onRemoveFG).toHaveBeenCalledWith({ fgIds: [scene.fgId] });
      expect(dropAndMerge).not.toHaveBeenCalled();
    });
  });
});
