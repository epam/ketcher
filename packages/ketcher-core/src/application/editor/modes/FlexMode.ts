import { CoreEditor } from 'application/editor/internal';
import { LayoutMode } from 'application/editor/modes/types';
import { BaseMode } from 'application/editor/modes/internal';
export class FlexMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('flex-layout-mode', previousMode);
  }

  initialize() {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();

    editor.drawingEntitiesManager.applyFlexLayoutMode();

    editor.renderersContainer.update();

    return command;
  }
}
