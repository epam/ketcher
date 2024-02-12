import { CoreEditor, LayoutMode } from 'application/editor';
import { BaseMode } from 'application/editor/modes/BaseMode';

export class SequenceMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('sequence-layout-mode', previousMode);
  }

  public initialize() {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();
    const modelChanges = editor.drawingEntitiesManager.reArrangeChains(
      editor.canvas.width.baseVal.value,
      true,
    );

    command.merge(modelChanges);
    editor.renderersContainer.update(modelChanges);

    editor.drawingEntitiesManager.applyMonomersSequenceLayout();

    return command;
  }
}
