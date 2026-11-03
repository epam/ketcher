import {
  CoordinateTransformation,
  KetSerializer,
  ketcherProvider,
  Vec2,
} from 'ketcher-core';
import Editor from '../Editor';
import PasteTool from './paste';

const SINGLE_ATOM_KET = JSON.stringify({
  root: { nodes: [{ $ref: 'mol0' }] },
  mol0: {
    type: 'molecule',
    atoms: [{ label: 'C', location: [0, 0, 0] }],
  },
});

const METHANOL_KET = JSON.stringify({
  root: { nodes: [{ $ref: 'mol0' }] },
  mol0: {
    type: 'molecule',
    atoms: [
      { label: 'C', location: [0, 0, 0] },
      { label: 'O', location: [1, 0, 0] },
    ],
    bonds: [{ type: 1, atoms: [0, 1] }],
  },
});

const TARGET_ATOM_ID = 0;

function deserialize(ket: string) {
  const struct = new KetSerializer().deserialize(ket);
  struct.markFragments();
  return struct;
}

function setupPaste(pastedKet: string) {
  // Raphael needs the document as the client area under jsdom, and the
  // document has no layout of its own.
  const clientArea = Object.assign(document, {
    clientWidth: 0,
    clientHeight: 0,
    getBoundingClientRect: () => new DOMRect(),
  }) as unknown as HTMLElement;
  const editor = new Editor('1', clientArea, {}, {});
  editor.struct(deserialize(SINGLE_ATOM_KET));
  const pasteTool = new PasteTool(editor, deserialize(pastedKet));

  const [firstPastedAtomId] = [...editor.struct().atoms.keys()].filter(
    (aid) => aid !== TARGET_ATOM_ID,
  );
  // State after hovering the first pasted atom over the target atom.
  pasteTool.setMergeItems({
    atoms: new Map([[firstPastedAtomId, TARGET_ATOM_ID]]),
    bonds: new Map(),
  });

  return { editor, pasteTool };
}

function mouseEventAt(editor: Editor, modelPoint: Vec2) {
  const { x, y } = CoordinateTransformation.modelToView(
    modelPoint,
    editor.render,
  );
  return new MouseEvent('mousemove', { clientX: x, clientY: y });
}

function targetAtomPosition(editor: Editor) {
  const targetAtom = editor.struct().atoms.get(TARGET_ATOM_ID);
  if (!targetAtom) {
    throw new Error('Target atom is missing');
  }
  return new Vec2(targetAtom.pp);
}

function dragFromTargetAtom(
  editor: Editor,
  pasteTool: PasteTool,
  offset: Vec2,
) {
  const start = targetAtomPosition(editor);
  pasteTool.mousedown(mouseEventAt(editor, start));
  pasteTool.mousemove(mouseEventAt(editor, start.add(offset)));
  pasteTool.mouseup();
}

function bondsOf(editor: Editor, atomId: number) {
  return [...editor.struct().bonds.values()].filter(
    (bond) => bond.begin === atomId || bond.end === atomId,
  );
}

describe('PasteTool', () => {
  beforeAll(() => {
    globalThis.window.PointerEvent =
      MouseEvent as unknown as typeof PointerEvent;
  });

  beforeEach(() => {
    jest.spyOn(ketcherProvider, 'getKetcher').mockReturnValue({
      changeEvent: { dispatch: jest.fn() },
    } as unknown as ReturnType<typeof ketcherProvider.getKetcher>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('dragging away from the atom the paste would merge with', () => {
    it('attaches a pasted atom to the target atom by a new bond', () => {
      const { editor, pasteTool } = setupPaste(SINGLE_ATOM_KET);

      dragFromTargetAtom(editor, pasteTool, new Vec2(2, 0));

      expect(editor.struct().atoms.size).toBe(2);
      expect(editor.struct().bonds.size).toBe(1);
      expect(bondsOf(editor, TARGET_ATOM_ID)).toHaveLength(1);
    });

    it('attaches the whole pasted structure through the hovered atom', () => {
      const { editor, pasteTool } = setupPaste(METHANOL_KET);

      dragFromTargetAtom(editor, pasteTool, new Vec2(0, 2));

      const struct = editor.struct();
      expect(struct.atoms.size).toBe(3);
      expect(struct.bonds.size).toBe(2);
      const [newBond] = bondsOf(editor, TARGET_ATOM_ID);
      const attachedAtomId =
        newBond.begin === TARGET_ATOM_ID ? newBond.end : newBond.begin;
      // The hovered pasted atom is the carbon, so the oxygen stays outside.
      expect(struct.atoms.get(attachedAtomId)?.label).toBe('C');
    });

    it('records the attachment as a single history entry', () => {
      const { editor, pasteTool } = setupPaste(METHANOL_KET);
      const undoCountBefore = editor.historySize().undo;

      dragFromTargetAtom(editor, pasteTool, new Vec2(2, 0));
      editor.undo();

      expect(editor.historySize().undo).toBe(undoCountBefore);
      expect(editor.struct().atoms.size).toBe(1);
      expect(editor.struct().bonds.size).toBe(0);
    });
  });

  it('merges without a new bond when released on the target atom', () => {
    const { editor, pasteTool } = setupPaste(SINGLE_ATOM_KET);

    dragFromTargetAtom(editor, pasteTool, new Vec2(0.5, 0));

    expect(editor.struct().atoms.size).toBe(1);
    expect(editor.struct().bonds.size).toBe(0);
  });
});
