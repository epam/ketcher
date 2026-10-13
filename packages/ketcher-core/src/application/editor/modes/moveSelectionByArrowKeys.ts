import { Vec2 } from 'domain/entities';
import { provideEditorInstance } from '../editorSingleton';
import { EditorHistory } from '../EditorHistory';
import { Coordinates } from '../shared/coordinates';

// One arrow key press moves the selection by 1 canvas px; holding Shift multiplies that step by 10.
const SHIFT_STEP_MULTIPLIER = 10;

const arrowKeyUnitVectors: Record<string, Vec2> = {
  ArrowUp: new Vec2(0, -1),
  ArrowDown: new Vec2(0, 1),
  ArrowLeft: new Vec2(-1, 0),
  ArrowRight: new Vec2(1, 0),
};

function moveSelectionByArrowKey(event: KeyboardEvent) {
  const unitVector = arrowKeyUnitVectors[event.key];
  if (!unitVector) {
    return;
  }

  const editor = provideEditorInstance();
  const canvasStep = unitVector.scaled(
    event.shiftKey ? SHIFT_STEP_MULTIPLIER : 1,
  );
  const modelChanges =
    editor.drawingEntitiesManager.moveSelectedDrawingEntities(
      Coordinates.canvasToModel(canvasStep),
    );
  if (modelChanges.operations.length === 0) {
    return;
  }

  EditorHistory.getInstance(editor).update(modelChanges);
  editor.renderersContainer.update(modelChanges);
  editor.drawingEntitiesManager.rerenderBondsOverlappedByMonomers();
  editor.events.selectEntities.dispatch(
    editor.drawingEntitiesManager.selectedEntities.map((entity) => entity[1]),
  );
}

export const moveSelectionByArrowKeysHandlers = {
  'move-selection-by-arrow-keys': {
    shortcut: [
      'ArrowUp',
      'Shift+ArrowUp',
      'ArrowDown',
      'Shift+ArrowDown',
      'ArrowLeft',
      'Shift+ArrowLeft',
      'ArrowRight',
      'Shift+ArrowRight',
    ],
    handler: moveSelectionByArrowKey,
  },
};
