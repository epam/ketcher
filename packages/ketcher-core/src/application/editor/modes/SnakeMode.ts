import { BaseMode } from 'application/editor/modes/BaseMode';
import { CoreEditor } from 'application/editor/internal';
import { LayoutMode } from 'application/editor/modes';

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

  public onKeyDown(_event: KeyboardEvent) {}
}
