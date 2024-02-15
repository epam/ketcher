import { CoreEditor, LayoutMode } from 'application/editor';
import { BaseMode } from 'application/editor/modes/BaseMode';
import ZoomTool from 'application/editor/tools/Zoom';

export class SequenceMode extends BaseMode {
  constructor(previousMode?: LayoutMode) {
    super('sequence-layout-mode', previousMode);
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
}
