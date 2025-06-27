import { LayoutMode } from 'application/editor/modes/types';
import { BaseMode } from 'application/editor/modes/internal';
import { CoreEditor } from '../Editor';
import { Coordinates } from '../internal';
import { Command } from 'domain/entities/Command';

export class FlexMode extends BaseMode {
  constructor(coreEditorId: string, previousMode?: LayoutMode) {
    super(coreEditorId, 'flex-layout-mode', previousMode);
  }

  initialize() {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance(this.coreEditorId);

    const modelChanges =
      editor.drawingEntitiesManager.applyFlexLayoutMode(true);

    command.merge(editor.drawingEntitiesManager.recalculateCanvasMatrix());

    editor.renderersContainer.update(modelChanges);

    if (this.previousMode === 'sequence-layout-mode') {
      editor.scrollToTopLeftCorner();
    }

    return command;
  }

  getNewNodePosition() {
    const editor = CoreEditor.provideEditorInstance(this.coreEditorId);

    return Coordinates.canvasToModel(editor.lastCursorPositionOfCanvas);
  }

  applyAdditionalPasteOperations() {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance(this.coreEditorId);

    editor.drawingEntitiesManager.recalculateAntisenseChains();

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
