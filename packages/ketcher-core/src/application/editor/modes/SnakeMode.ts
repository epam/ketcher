import { BaseMode } from 'application/editor/modes/BaseMode';
import { LayoutMode } from 'application/editor/modes';
import ZoomTool from '../tools/Zoom';
import { CoreEditor } from '../Editor';

export class SnakeMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('snake-layout-mode', previousMode);
  }

  public initialize() {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();
    const modelChanges = editor.drawingEntitiesManager.reArrangeChains(
      editor.canvas.width.baseVal.value,
      true,
    );
    editor.drawingEntitiesManager.applyFlexLayoutMode();

    command.merge(modelChanges);
    editor.renderersContainer.update(modelChanges);
    command.setUndoOperationReverse();

    return command;
  }

  get keyboardEventHandlers() {
    return {
      copy: {
        shortcut: ['Mod+c'],
        handler: (event) => this.copyToClipboard(event),
      },
      paste: {
        shortcut: ['Mod+v'],
        handler: (event) => this.pasteFromClipboard(event),
      },
    };
  }

  getNewNodePosition() {
    const editor = CoreEditor.provideEditorInstance();
    return editor.drawingEntitiesManager.lastPosition;
  }

  scrollForView() {
    const zoom = ZoomTool.instance;
    zoom.scrollToVerticalBottom();
  }
}
