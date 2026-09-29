import {
  fromMultipleMove,
  KetSerializer,
  ketcherProvider,
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

function setupDraggedPhosphate(
  mergeItems?: SelectionMoveDragContext['mergeItems'],
) {
  const editor = new Editor('1', document as unknown as HTMLElement, {}, {});
  editor.struct(new KetSerializer().deserialize(NUCLEOTIDE_COMPONENTS_KET));
  const initialPositions = [...editor.struct().atoms.values()].map(
    (atom) => new Vec2(atom.pp),
  );

  editor.selection({ atoms: PHOSPHATE_ATOMS, bonds: PHOSPHATE_BONDS });
  // Mimic the state SelectTool.mousemove leaves behind: the move is already
  // applied to the canvas but not yet recorded in history.
  const action = fromMultipleMove(
    editor.render.ctab,
    editor.explicitSelected(),
    new Vec2(0, 5),
  );
  editor.update(action, true);

  const selectTool = new SelectTool(editor, 'rectangle');
  selectTool.isMouseDown = true;
  const dragCtx: SelectionMoveDragContext = {
    item: { map: 'atoms', id: PHOSPHATE_ATOMS[0], dist: 0 },
    xy0: new Vec2(),
    action,
    mergeItems,
  };
  // @ts-expect-error dragCtx is private; mousedown/mousemove need a real canvas
  selectTool.dragCtx = dragCtx;

  return { editor, selectTool, initialPositions };
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
      const { editor, selectTool } = setupDraggedPhosphate({
        atoms: new Map([[2, 1]]),
        bonds: new Map(),
        atomToFunctionalGroup: new Map(),
      });
      const historyLengthBefore = editor.historyStack.length;

      selectTool.mouseup(new PointerEvent('mouseup'));

      expect(editor.struct().atoms.size).toBe(4);
      expect(editor.struct().bonds.size).toBe(3);
      expect(editor.historyStack).toHaveLength(historyLengthBefore + 1);
    });
  });
});
