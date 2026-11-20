import { Vec2 } from 'domain/entities';
import { provideEditorInstance } from '../editorSingleton';
import { EditorHistory } from '../EditorHistory';
import { Coordinates } from '../shared/coordinates';
import type { SelectBase } from '../tools/select/SelectBase';

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
  // The selection itself is unchanged, so skip `selectEntities`: only the
  // rotation handle depends on the selection bounds and needs a redraw.
  // Check the tool by name: a runtime SelectBase import creates a circular
  // dependency through the renderers.
  if (editor.selectedTool?.name === 'select-tool') {
    (editor.selectedTool as SelectBase).updateRotationView();
  }
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
