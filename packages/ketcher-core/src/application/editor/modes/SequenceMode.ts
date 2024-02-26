import { CoreEditor } from 'application/editor/internal';
import { LayoutMode } from 'application/editor/modes';
import { BaseMode } from 'application/editor/modes/BaseMode';
import ZoomTool from 'application/editor/tools/Zoom';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';

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

  public initialize() {
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

    if (firstMonomerPosition) {
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
    SequenceRenderer.setCaretPositionBySequenceItemRenderer(sequenceItemRenderer);
    this.initialize();
  }
}
