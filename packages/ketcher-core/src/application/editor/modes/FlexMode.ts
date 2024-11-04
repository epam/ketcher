import { LayoutMode } from 'application/editor/modes/types';
import { BaseMode } from 'application/editor/modes/internal';
import { CoreEditor } from '../Editor';
import { Coordinates } from '../internal';
import { Command } from 'domain/entities/Command';
export class FlexMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('flex-layout-mode', previousMode);
  }

  initialize() {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();

    const modelChanges =
      editor.drawingEntitiesManager.applyFlexLayoutMode(true);

    command.merge(editor.drawingEntitiesManager.recalculateCanvasMatrix());

    editor.renderersContainer.update(modelChanges);

    return command;
  }

  getNewNodePosition() {
    const editor = CoreEditor.provideEditorInstance();

    return Coordinates.canvasToModel(editor.lastCursorPositionOfCanvas);
  }

  applyAdditionalPasteOperations() {
    return new Command();
  }

  isPasteAllowedByMode(): boolean {
    return true;
  }

  isPasteAvailable(): boolean {
    return true;
  }

  scrollForView(): void {}
}
