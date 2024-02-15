import { BaseMode } from 'application/editor/modes/BaseMode';
import { CoreEditor, LayoutMode } from 'application/editor';

export class SnakeMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('snake-layout-mode', previousMode);
  }

  public initialize() {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();
    editor.drawingEntitiesManager.applyFlexLayoutMode();
    const modelChanges = editor.drawingEntitiesManager.reArrangeChains(
      editor.canvas.width.baseVal.value,
      true,
    );

    command.merge(modelChanges);
    editor.renderersContainer.update(modelChanges);
    command.setUndoOperationReverse();

    return command;
  }
}
