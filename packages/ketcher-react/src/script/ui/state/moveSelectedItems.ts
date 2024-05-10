import {
  Editor,
  Vec2,
  EditorSelection,
  fromMultipleMove,
  ReAtom,
  Scale,
} from 'ketcher-core';

type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowRight' | 'ArrowLeft';
const destinationVectorMapping: { [key in ArrowKey]: Vec2 } = {
  ArrowUp: new Vec2(0, -1),
  ArrowDown: new Vec2(0, 1),
  ArrowRight: new Vec2(1, 0),
  ArrowLeft: new Vec2(-1, 0),
};

export function isArrowKey(key: string): key is ArrowKey {
  return (
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    key === 'ArrowLeft' ||
    key === 'ArrowRight'
  );
}

export function moveSelectedItems(
  editor: Editor,
  key: ArrowKey,
  isShiftPressed: boolean,
) {
  const getFasterStep = (vec: Vec2) => vec.scaled(10);
  const selectedItems = editor.explicitSelected();
  const destinationVectorInCanvas = destinationVectorMapping[key];
  const destinationVector = Scale.canvasToModel(
    destinationVectorInCanvas,
    editor.render.options,
  );
  const action = fromMultipleMove(
    editor.render.ctab,
    selectedItems,
    isShiftPressed ? getFasterStep(destinationVector) : destinationVector,
  );
  editor.update(action, false, { resizeCanvas: true });
  const isClose = isCloseToTheEdgeOfCanvas(selectedItems, editor, key);
  if (isClose) {
    const moveStep = isShiftPressed
      ? getFasterStep(destinationVectorInCanvas)
      : destinationVectorInCanvas;
    editor.render.setViewBox((prev) => ({
      ...prev,
      minX: prev.minX + moveStep.x,
      minY: prev.minY + moveStep.y,
    }));
  }
  editor.rotateController.rerender();
}

const EDGE_OFFSET = 50;

function isCloseToTheEdgeOfCanvas(
  selectedItems: EditorSelection,
  editor: Editor,
  key: ArrowKey,
) {
  if (!selectedItems.atoms) {
    return false;
  }
  const restruct = editor.render.ctab;
  let theMostTopAtom = restruct.atoms.get(selectedItems?.atoms[0]);
  let theMostBottomAtom = restruct.atoms.get(selectedItems?.atoms[0]);
  let theMostRightAtom = restruct.atoms.get(selectedItems?.atoms[0]);
  let theMostLeftAtom = restruct.atoms.get(selectedItems?.atoms[0]);

  selectedItems.atoms.forEach((atomId) => {
    const atom = restruct.atoms.get(atomId);
    const position = atom?.a.pp;
    if (position && theMostTopAtom) {
      theMostTopAtom =
        position.y < theMostTopAtom.a.pp.y ? atom : theMostTopAtom;
    }
    if (position && theMostBottomAtom) {
      theMostBottomAtom =
        position.y > theMostBottomAtom.a.pp.y ? atom : theMostBottomAtom;
    }
    if (position && theMostRightAtom) {
      theMostRightAtom =
        position.x > theMostRightAtom.a.pp.x ? atom : theMostRightAtom;
    }
    if (position && theMostLeftAtom) {
      theMostLeftAtom =
        position.x < theMostLeftAtom.a.pp.x ? atom : theMostLeftAtom;
    }
  });
  if (
    theMostTopAtom &&
    theMostBottomAtom &&
    theMostRightAtom &&
    theMostLeftAtom
  ) {
    const getScreenCoordinates = (atom: ReAtom) =>
      Scale.modelToCanvas(atom.a.pp, editor.render.options);
    const theMostTopAtomYCoordinate = getScreenCoordinates(theMostTopAtom).y;
    const theMostBottomAtomYCoordinate =
      getScreenCoordinates(theMostBottomAtom).y;
    const theMostRightAtomXCoordinate =
      getScreenCoordinates(theMostRightAtom).x;
    const theMostLeftAtomXCoordinate = getScreenCoordinates(theMostLeftAtom).x;

    const viewBox = editor.render.viewBox;
    const isCloseToTop =
      theMostTopAtomYCoordinate <= viewBox.minY + EDGE_OFFSET;
    const isCloseToBottom =
      theMostBottomAtomYCoordinate >=
      viewBox.minY + viewBox.height - EDGE_OFFSET;
    const isCloseToLeft =
      theMostLeftAtomXCoordinate <= viewBox.minX + EDGE_OFFSET;
    const isCloseToRight =
      theMostRightAtomXCoordinate >= viewBox.minX + viewBox.width - EDGE_OFFSET;
    return (
      (isCloseToTop && key === 'ArrowUp') ||
      (isCloseToBottom && key === 'ArrowDown') ||
      (isCloseToLeft && key === 'ArrowLeft') ||
      (isCloseToRight && key === 'ArrowRight')
    );
  }
  return false;
}
