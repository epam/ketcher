import {
  Atom,
  FunctionalGroupsProvider,
  SaltsAndSolventsProvider,
  SGroup,
  Struct,
  Vec2,
  fromNewCanvas,
} from 'ketcher-core';
import Editor from '../../Editor';
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

  const mouseupWithDragContext = (mergeItems: object) => {
    const tool = new SelectTool(editor, 'rectangle');
    tool.isMouseDown = true;
    Reflect.set(tool, 'dragCtx', {
      item: { map: 'atoms', id: 0 },
      xy0: new Vec2(),
      action: null,
      mergeItems,
    });
    tool.mouseup(new MouseEvent('mouseup') as PointerEvent);
  };

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
});
