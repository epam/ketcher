import { LayoutMode } from 'application/editor/modes/types';
import { BaseMode } from 'application/editor/modes/internal';
import { Coordinates } from '../internal';
import { Command } from 'domain/entities/Command';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

const getCoreEditorInstance = () => {
  const { CoreEditor } = require('../Editor');
  return CoreEditor.provideEditorInstance();
};

export class FlexMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('flex-layout-mode', previousMode);
  }

  initialize() {
    const command = super.initialize();
    const editor = getCoreEditorInstance();

    const modelChanges =
      editor.drawingEntitiesManager.applyFlexLayoutMode(true);

    command.merge(editor.drawingEntitiesManager.recalculateCanvasMatrix());

    editor.renderersContainer.update(modelChanges);

    return command;
  }

  getNewNodePosition() {
    const editor = getCoreEditorInstance();

    return Coordinates.canvasToModel(editor.lastCursorPositionOfCanvas);
  }

  applyAdditionalPasteOperations(
    mergedDrawingEntities: DrawingEntitiesManager,
  ) {
    const command = new Command();
    const editor = getCoreEditorInstance();

    editor.drawingEntitiesManager.recalculateAntisenseChains();
    command.merge(
      editor.drawingEntitiesManager.selectDrawingEntities(
        mergedDrawingEntities.allEntitiesArray,
      ),
    );

    if (!editor.drawingEntitiesManager.hasAntisenseChains) {
      return command;
    }

    command.merge(
      editor.drawingEntitiesManager.applySnakeLayout(true, true, true),
    );

    command.setUndoOperationsByPriority();

    return command;
  }

  isPasteAllowedByMode(): boolean {
    return true;
  }

  isPasteAvailable(): boolean {
    return true;
  }

  scrollForView(): void {}
}
