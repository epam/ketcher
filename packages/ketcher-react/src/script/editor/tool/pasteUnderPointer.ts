import type Editor from '../Editor';
import PasteTool from './paste';

export interface ClientPosition {
  clientX: number;
  clientY: number;
}

const MAX_ATTEMPTS = 10;

/**
 * Last known pointer position in client coordinates, or null when the pointer
 * has not been seen over the canvas (no mouse event yet, or it is outside).
 */
export function getPointerPositionOnCanvas(
  editor: Editor,
): ClientPosition | null {
  const { x, y } = editor.lastCursorPosition;
  const {
    x: left,
    y: top,
    width,
    height,
  } = editor.render.clientArea.getBoundingClientRect();

  const isNeverMoved = x === 0 && y === 0;
  const isInside = x >= 0 && y >= 0 && x <= width && y <= height;
  return !isNeverMoved && isInside
    ? { clientX: left + x, clientY: top + y }
    : null;
}

/**
 * The paste tool is created asynchronously by the Redux flow and always starts
 * at the canvas center. Moves the preview of the pasted content under the
 * given position as soon as the tool is active.
 */
export function placePastedContentUnderPointer(
  editor: Editor,
  position: ClientPosition,
  attemptsLeft = MAX_ATTEMPTS,
): void {
  const tool = editor.tool();
  if (tool instanceof PasteTool) {
    tool.mousemove(new MouseEvent('mousemove', position));
  } else if (attemptsLeft > 0) {
    requestAnimationFrame(() =>
      placePastedContentUnderPointer(editor, position, attemptsLeft - 1),
    );
  }
}
