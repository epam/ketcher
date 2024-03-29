import { LayoutMode } from 'application/editor/modes/types';
import { BaseMode } from 'application/editor/modes/internal';
import { CoreEditor } from '../Editor';
import { Coordinates } from '../internal';
export class FlexMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('flex-layout-mode', previousMode);
  }

  initialize() {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();

    const modelChanges =
      editor.drawingEntitiesManager.applyFlexLayoutMode(true);

    editor.renderersContainer.update(modelChanges);

    return command;
  }

  get keyboardEventHandlers() {
    return {
      copy: {
        shortcut: ['Mod+c'],
        handler: () => this.copyToClipboard(),
      },
      paste: {
        shortcut: ['Mod+v'],
        handler: () => this.pasteFromClipboard(),
      },
    };
  }

  getNewNodePosition() {
    const editor = CoreEditor.provideEditorInstance();
    return Coordinates.canvasToModel(editor.lastCursorPositionOfCanvas);
  }
}
