import { CoreEditor, LayoutMode } from 'application/editor';
import { BaseMode } from 'application/editor/modes/BaseMode';

export class SequenceMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('sequence-layout-mode', previousMode);
  }

  public initialize() {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();
    editor.drawingEntitiesManager.applyMonomersSequenceLayout();

    return command;
  }
}
