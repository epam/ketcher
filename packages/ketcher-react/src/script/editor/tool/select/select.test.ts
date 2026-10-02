import {
  fromMultipleMove,
  KetSerializer,
  ketcherProvider,
  SaltsAndSolventsProvider,
  Struct,
  Vec2,
} from 'ketcher-core';
import Editor from '../../Editor';
import SelectTool from './select';
import type { SelectionMoveDragContext } from './select.types';

const NUCLEOTIDE_COMPONENTS_KET = JSON.stringify({
  root: { nodes: [{ $ref: 'mol0' }] },
  mol0: {
    type: 'molecule',
    atoms: [
      { label: 'C', location: [0, 0, 0] },
      { label: 'C', location: [1, 0, 0] },
      { label: 'C', location: [2, 0, 0] },
      { label: 'C', location: [3, 0, 0] },
    ],
    bonds: [
      { type: 1, atoms: [0, 1] },
      { type: 1, atoms: [1, 2] },
      { type: 1, atoms: [2, 3] },
    ],
    sgroups: [
      {
        type: 'SUP',
        atoms: [0, 1],
        name: '',
        expanded: true,
        id: 0,
        class: 'SUGAR',
      },
      {
        type: 'SUP',
        atoms: [2, 3],
        name: '',
        expanded: true,
        id: 1,
        class: 'PHOSPHATE',
      },
    ],
  },
});

const PHOSPHATE_ATOMS = [2, 3];
const PHOSPHATE_BONDS = [2];

const SALT_NAME = 'acetic acid';

// Chain (atoms 0-2, bonds 0-1) and acetic acid salt (atoms 3-6, bonds 2-4).
const CHAIN_AND_SALT_KET = JSON.stringify({
  root: { nodes: [{ $ref: 'mol0' }, { $ref: 'mol1' }] },
  mol0: {
    type: 'molecule',
    atoms: [
      { label: 'C', location: [0, 0, 0] },
      { label: 'C', location: [1, 0, 0] },
      { label: 'C', location: [2, 0, 0] },
    ],
    bonds: [
      { type: 1, atoms: [0, 1] },
      { type: 1, atoms: [1, 2] },
    ],
  },
  mol1: {
    type: 'molecule',
    atoms: [
      { label: 'C', location: [0, -4, 0] },
      { label: 'C', location: [-1, -4.5, 0] },
      { label: 'O', location: [1, -4.5, 0] },
      { label: 'O', location: [0, -3, 0] },
    ],
    bonds: [
      { type: 1, atoms: [0, 1] },
      { type: 1, atoms: [0, 2] },
      { type: 2, atoms: [0, 3] },
    ],
    sgroups: [
      {
        type: 'SUP',
        atoms: [0, 1, 2, 3],
        name: SALT_NAME,
        expanded: true,
        id: 0,
      },
    ],
  },
});

const CHAIN_ATOMS = [0, 1, 2];
const CHAIN_BONDS = [0, 1];
const SALT_ATOMS = [3, 4, 5, 6];
const SALT_BONDS = [2, 3, 4];

function setupDrag(
  ket: string,
  dragged: { atoms: number[]; bonds: number[] },
  mergeItems?: SelectionMoveDragContext['mergeItems'],
) {
  const editor = new Editor('1', document as unknown as HTMLElement, {}, {});
  editor.struct(new KetSerializer().deserialize(ket));
  const initialPositions = [...editor.struct().atoms.values()].map(
    (atom) => new Vec2(atom.pp),
  );

  editor.selection(dragged);
  // State after mousemove: move applied, not yet in history.
  const action = fromMultipleMove(
    editor.render.ctab,
    editor.explicitSelected(),
    new Vec2(0, 5),
  );
  editor.update(action, true);

  const selectTool = new SelectTool(editor, 'rectangle');
  selectTool.isMouseDown = true;
  const dragCtx: SelectionMoveDragContext = {
    item: { map: 'atoms', id: dragged.atoms[0], dist: 0 },
    xy0: new Vec2(),
    action,
    mergeItems,
  };
  // @ts-expect-error dragCtx is private; mousedown/mousemove need a real canvas
  selectTool.dragCtx = dragCtx;

  return { editor, selectTool, initialPositions };
}

function setupDraggedPhosphate(
  mergeItems?: SelectionMoveDragContext['mergeItems'],
) {
  return setupDrag(
    NUCLEOTIDE_COMPONENTS_KET,
    { atoms: PHOSPHATE_ATOMS, bonds: PHOSPHATE_BONDS },
    mergeItems,
  );
}

function mergeAtom(src: number, dst: number) {
  return {
    atoms: new Map([[src, dst]]),
    bonds: new Map(),
    atomToFunctionalGroup: new Map(),
  };
}

describe('SelectTool', () => {
  beforeAll(() => {
    global.window.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
  });

  beforeEach(() => {
    jest.spyOn(ketcherProvider, 'getKetcher').mockReturnValue({
      changeEvent: { dispatch: jest.fn() },
    } as unknown as ReturnType<typeof ketcherProvider.getKetcher>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('mouseup after dragging a nucleotide component', () => {
    it('records the move as a single history entry', () => {
      const { editor, selectTool } = setupDraggedPhosphate();
      const historyLengthBefore = editor.historyStack.length;

      selectTool.mouseup(new PointerEvent('mouseup'));

      expect(editor.historyStack).toHaveLength(historyLengthBefore + 1);
    });

    it('returns to the pre-drag state with one undo', () => {
      const { editor, selectTool, initialPositions } = setupDraggedPhosphate();
      const undoCountBefore = editor.historySize().undo;

      selectTool.mouseup(new PointerEvent('mouseup'));
      editor.undo();

      expect(editor.historySize().undo).toBe(undoCountBefore);

      const positions = [...editor.struct().atoms.values()].map(
        (atom) => atom.pp,
      );
      positions.forEach((position, index) => {
        expect(position.x).toBeCloseTo(initialPositions[index].x);
        expect(position.y).toBeCloseTo(initialPositions[index].y);
      });
    });

    it('does not fuse atoms of the dragged component with the target', () => {
      const { editor, selectTool } = setupDraggedPhosphate(mergeAtom(2, 1));
      const historyLengthBefore = editor.historyStack.length;

      selectTool.mouseup(new PointerEvent('mouseup'));

      expect(editor.struct().atoms.size).toBe(4);
      expect(editor.struct().bonds.size).toBe(3);
      expect(editor.historyStack).toHaveLength(historyLengthBefore + 1);
    });
  });

  describe('mouseup after dragging over a salt or solvent', () => {
    beforeEach(() => {
      const salt = new Struct();
      salt.name = SALT_NAME;
      salt.abbreviation = SALT_NAME;
      SaltsAndSolventsProvider.getInstance().setSaltsAndSolventsList([salt]);
    });

    afterEach(() => {
      SaltsAndSolventsProvider.getInstance().setSaltsAndSolventsList([]);
    });

    it('does not fuse a salt dropped onto a structure', () => {
      const { editor, selectTool } = setupDrag(
        CHAIN_AND_SALT_KET,
        { atoms: SALT_ATOMS, bonds: SALT_BONDS },
        mergeAtom(SALT_ATOMS[0], CHAIN_ATOMS[1]),
      );
      const historyLengthBefore = editor.historyStack.length;

      selectTool.mouseup(new PointerEvent('mouseup'));

      expect(editor.struct().atoms.size).toBe(7);
      expect(editor.historyStack).toHaveLength(historyLengthBefore + 1);
    });

    it('does not fuse a structure dropped onto a salt', () => {
      const { editor, selectTool } = setupDrag(
        CHAIN_AND_SALT_KET,
        { atoms: CHAIN_ATOMS, bonds: CHAIN_BONDS },
        mergeAtom(CHAIN_ATOMS[1], SALT_ATOMS[0]),
      );
      const historyLengthBefore = editor.historyStack.length;

      selectTool.mouseup(new PointerEvent('mouseup'));

      expect(editor.struct().atoms.size).toBe(7);
      expect(editor.historyStack).toHaveLength(historyLengthBefore + 1);
    });

    it('fuses a structure dropped onto a superatom that is not a salt', () => {
      SaltsAndSolventsProvider.getInstance().setSaltsAndSolventsList([]);
      const { editor, selectTool } = setupDrag(
        CHAIN_AND_SALT_KET,
        { atoms: CHAIN_ATOMS, bonds: CHAIN_BONDS },
        mergeAtom(CHAIN_ATOMS[1], SALT_ATOMS[0]),
      );

      selectTool.mouseup(new PointerEvent('mouseup'));

      expect(editor.struct().atoms.size).toBe(6);
    });
  });
});
