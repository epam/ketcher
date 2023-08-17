import { Editor, ReAtom } from 'ketcher-core';

export function getSelectedAreaCoordinates(editor: Editor) {
  const restruct = editor.render.ctab;
  const selectedItems = editor.explicitSelected();
  if (!selectedItems.atoms) {
    return false;
  }
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
    const scale = editor.options().scale;
    const offset = editor.render.options.offset;

    const getScreenCoordinates = (atom: ReAtom) =>
      atom.a.pp.scaled(scale).add(offset);

    const theMostTopAtomYCoordinate = getScreenCoordinates(theMostTopAtom).y;
    const theMostBottomAtomYCoordinate =
      getScreenCoordinates(theMostBottomAtom).y;
    const theMostRightAtomXCoordinate =
      getScreenCoordinates(theMostRightAtom).x;
    const theMostLeftAtomXCoordinate = getScreenCoordinates(theMostLeftAtom).x;
    return {
      leftX: theMostLeftAtomXCoordinate,
      topY: theMostTopAtomYCoordinate,
      rightX: theMostRightAtomXCoordinate,
      bottomY: theMostBottomAtomYCoordinate,
    };
  }
  return false;
}
