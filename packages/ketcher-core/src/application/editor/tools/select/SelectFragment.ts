import { SelectBase } from 'application/editor/tools/select/SelectBase';
import { CoreEditor } from 'application/editor';
import { BaseRenderer } from 'application/render';

export class SelectFragment extends SelectBase {
  constructor(readonly editor: CoreEditor) {
    super(editor);
  }

  protected createSelectionView() {}

  protected onSelectionMove() {}

  protected updateSelectionViewParams() {}

  protected mousedownEntity(
    renderer: BaseRenderer,
    shiftKey = false,
    modKey = false,
  ): void {
    super.mousedownEntity(renderer, shiftKey, modKey);
    const command =
      this.editor.drawingEntitiesManager.selectAllConnectedEntities(
        renderer.drawingEntity,
      );
    this.editor.renderersContainer.update(command);
  }

  mouseOverDrawingEntity(event) {
    const renderer = event.target.__data__;
    const modelChanges =
      this.editor.drawingEntitiesManager.intendToSelectAllConnectedDrawingEntities(
        renderer.drawingEntity,
      );
    this.editor.renderersContainer.update(modelChanges);
  }

  mouseLeaveDrawingEntity(event) {
    const renderer: BaseRenderer = event.target.__data__;
    const modelChanges =
      this.editor.drawingEntitiesManager.cancelIntentionToSelectAllConnectedDrawingEntities(
        renderer.drawingEntity,
      );
    this.editor.renderersContainer.update(modelChanges);
  }
}
