import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { LayoutMode } from 'application/editor/modes';
import { BaseMode } from 'application/editor/modes/BaseMode';
import ZoomTool from 'application/editor/tools/Zoom';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { initHotKeys, keyNorm } from 'utilities';
import { AttachmentPointName } from 'domain/types';
import { Command } from 'domain/entities/Command';

export class SequenceMode extends BaseMode {
  public _isEditMode = false;
  constructor(previousMode?: LayoutMode) {
    super('sequence-layout-mode', previousMode);
  }

  get isEditMode() {
    return this._isEditMode;
  }

  set isEditMode(isEditMode) {
    this._isEditMode = isEditMode;
  }

  public initialize(needScroll = true) {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();

    editor.drawingEntitiesManager.applyFlexLayoutMode();

    const modelChanges = editor.drawingEntitiesManager.reArrangeChains(
      editor.canvas.width.baseVal.value,
      true,
    );
    const zoom = ZoomTool.instance;

    editor.renderersContainer.update(modelChanges);

    const chainsCollection =
      editor.drawingEntitiesManager.applyMonomersSequenceLayout();
    const firstMonomerPosition =
      chainsCollection.firstNode?.monomer.renderer?.scaledMonomerPosition;

    if (firstMonomerPosition && needScroll) {
      zoom.scrollTo(firstMonomerPosition);
    }

    const turnOffSelectionCommand =
      editor?.drawingEntitiesManager.unselectAllDrawingEntities();
    editor?.renderersContainer.update(turnOffSelectionCommand);

    modelChanges.merge(command);

    editor.events.selectTool.dispatch('select-rectangle');

    return modelChanges;
  }

  public turnOnEditMode(sequenceItemRenderer: BaseSequenceItemRenderer) {
    this.isEditMode = true;
    SequenceRenderer.setCaretPositionBySequenceItemRenderer(
      sequenceItemRenderer,
    );
    this.initialize(false);
  }

  public onKeyUp(event: KeyboardEvent) {
    const hotKeys = initHotKeys(this.keyboardEventHandlers);
    const shortcutKey = keyNorm.lookup(hotKeys, event);

    this.keyboardEventHandlers[shortcutKey]?.handler();
  }

  private get keyboardEventHandlers() {
    return {
      delete: {
        shortcut: ['Backspace', 'Escape'],
        handler: () => {
          const editor = CoreEditor.provideEditorInstance();
          const history = new EditorHistory(editor);
          const previousNode =
            SequenceRenderer.previousFromCurrentEdittingMonomer;
          const currentNode = SequenceRenderer.currentEdittingMonomer;
          const nextNode = SequenceRenderer.nextFromCurrentEdittingMonomer;
          const modelChanges = editor.drawingEntitiesManager.deleteMonomer(
            currentNode.monomer,
          );

          modelChanges.merge(
            editor.drawingEntitiesManager.createPolymerBond(
              previousNode.monomer,
              nextNode.monomer,
              AttachmentPointName.R2,
              AttachmentPointName.R1,
            ),
          );
          editor.renderersContainer.update(modelChanges);
          history.update(modelChanges);
          this.initialize(false);
          SequenceRenderer.moveCaretBack();
        },
      },
      'move-caret-forward': {
        shortcut: ['ArrowRight'],
        handler: () => {
          SequenceRenderer.moveCaretForward();
        },
      },
      'move-caret-back': {
        shortcut: ['ArrowLeft'],
        handler: () => {
          SequenceRenderer.moveCaretBack();
        },
      },
    };
  }
}
