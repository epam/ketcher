import { Editor, fromMultipleMove, Vec2 } from 'ketcher-core';

import {
  isCloseToTheEdges,
  scrollByDirection,
  scrollToEdgeOfScreen,
} from '../utils';

export function moveSelected(
  editor: Editor,
  destinationVector: Vec2,
  step: number,
  direction: string,
) {
  const stepFactor = step / editor.options().scale;
  const selectedItems = editor.explicitSelected();
  const action = fromMultipleMove(
    editor.render.ctab,
    selectedItems,
    destinationVector.scaled(stepFactor),
  );
  editor.update(action, false, { resizeCanvas: true });

  const {
    isCloseToEdgeOfCanvasAndMovingToEdge,
    isCloseToEdgeOfScreenAndMovingToEdge,
  } = isCloseToTheEdges(editor, direction);
  if (isCloseToEdgeOfCanvasAndMovingToEdge) {
    scrollToEdgeOfScreen(destinationVector, editor.render);
  } else if (isCloseToEdgeOfScreenAndMovingToEdge) {
    scrollByDirection(editor, direction);
  }
}
