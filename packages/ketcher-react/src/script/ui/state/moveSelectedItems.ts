import { Editor, Vec2, moveSelected } from 'ketcher-core';

type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowRight' | 'ArrowLeft';
const destinationVectorMapping: { [key in ArrowKey]: Vec2 } = {
  ArrowUp: new Vec2(0, -1),
  ArrowDown: new Vec2(0, 1),
  ArrowRight: new Vec2(1, 0),
  ArrowLeft: new Vec2(-1, 0),
};

const directionMapping: { [key in ArrowKey]: string } = {
  ArrowUp: 'MoveUp',
  ArrowDown: 'MoveDown',
  ArrowRight: 'MoveRight',
  ArrowLeft: 'MoveLeft',
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
  const destinationVector = destinationVectorMapping[key];
  moveSelected(
    editor,
    destinationVector,
    isShiftPressed,
    directionMapping[key],
  );
  editor.rotateController.rerender();
}
