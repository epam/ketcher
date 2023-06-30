import {
  Editor,
  Vec2,
  EditorSelection,
  fromMultipleMove,
  scrollByVector,
  ReAtom
} from 'ketcher-core'

type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowRight' | 'ArrowLeft'
const distinationVectorMapping: { [key in ArrowKey]: Vec2 } = {
  ArrowUp: new Vec2(0, -1),
  ArrowDown: new Vec2(0, 1),
  ArrowRight: new Vec2(1, 0),
  ArrowLeft: new Vec2(-1, 0)
}

export function isArrowKey(key: string): key is ArrowKey {
  return (
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    key === 'ArrowLeft' ||
    key === 'ArrowRight'
  )
}

export function moveSelectedItems(
  editor: Editor,
  key: ArrowKey,
  isShiftPressed: boolean
) {
  const stepFactor = 1 / editor.options().scale
  const fasterStepFactor = stepFactor * 10
  const selectedItems = editor.explicitSelected()
  const distinationVector = distinationVectorMapping[key]
  const action = fromMultipleMove(
    editor.render.ctab,
    selectedItems,
    distinationVector.scaled(isShiftPressed ? fasterStepFactor : stepFactor)
  )
  editor.update(action, false, { resizeCanvas: true })
  const isClose = isCloseToTheEdgeOfCanvas(selectedItems, editor, key)
  if (isClose) {
    scrollByVector(distinationVector, editor.render)
  }
  editor.rotateController.rerender()
}

const edgeOffset = 150

function isCloseToTheEdgeOfCanvas(
  selectedItems: EditorSelection,
  editor: Editor,
  key: ArrowKey
) {
  if (!selectedItems.atoms) {
    return false
  }
  const restruct = editor.render.ctab
  let theMostTopAtom = restruct.atoms.get(selectedItems?.atoms[0])
  let theMostBottomAtom = restruct.atoms.get(selectedItems?.atoms[0])
  let theMostRightAtom = restruct.atoms.get(selectedItems?.atoms[0])
  let theMostLeftAtom = restruct.atoms.get(selectedItems?.atoms[0])

  selectedItems.atoms.forEach((atomId) => {
    const atom = restruct.atoms.get(atomId)
    const position = atom?.a.pp
    if (position && theMostTopAtom) {
      theMostTopAtom =
        position.y < theMostTopAtom.a.pp.y ? atom : theMostTopAtom
    }
    if (position && theMostBottomAtom) {
      theMostBottomAtom =
        position.y > theMostBottomAtom.a.pp.y ? atom : theMostBottomAtom
    }
    if (position && theMostRightAtom) {
      theMostRightAtom =
        position.x > theMostRightAtom.a.pp.x ? atom : theMostRightAtom
    }
    if (position && theMostLeftAtom) {
      theMostLeftAtom =
        position.x < theMostLeftAtom.a.pp.x ? atom : theMostLeftAtom
    }
  })
  if (
    theMostTopAtom &&
    theMostBottomAtom &&
    theMostRightAtom &&
    theMostLeftAtom
  ) {
    const scale = editor.options().scale
    const offset = editor.render.options.offset
    const body = document.body
    const getScreenCoordinates = (atom: ReAtom) =>
      atom.a.pp.scaled(scale).add(offset)
    const theMostTopAtomYCoordinate = getScreenCoordinates(theMostTopAtom).y
    const theMostBottomAtomYCoordinate =
      getScreenCoordinates(theMostBottomAtom).y
    const theMostRightAtomXCoordinate = getScreenCoordinates(theMostRightAtom).x
    const theMostLeftAtomXCoordinate = getScreenCoordinates(theMostLeftAtom).x
    const isCloseToTop = theMostTopAtomYCoordinate <= edgeOffset
    const isCloseToBottom =
      body.clientHeight - theMostBottomAtomYCoordinate <= edgeOffset
    const isCloseToLeft = theMostLeftAtomXCoordinate <= edgeOffset
    const isCloseToRight =
      body.clientWidth - theMostRightAtomXCoordinate <= edgeOffset
    return (
      (isCloseToTop && key === 'ArrowUp') ||
      (isCloseToBottom && key === 'ArrowDown') ||
      (isCloseToLeft && key === 'ArrowLeft') ||
      (isCloseToRight && key === 'ArrowRight')
    )
  }
  return false
}
