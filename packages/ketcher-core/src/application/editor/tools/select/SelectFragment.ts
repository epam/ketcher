import { SelectBase } from 'application/editor/tools/select/SelectBase';
import type { CoreEditor } from 'application/editor/Editor';
import { BaseRenderer } from 'application/render';

export class SelectFragment extends SelectBase {
  constructor(readonly editor: CoreEditor) {
    super(editor);
  }

  // TODO: needs investigation — sibling classes SelectLasso and SelectRectangle
  // have non-empty implementations. Determine if fragment selection intentionally
  // has no visual selection indicator or if these were never implemented.
  // See docs/empty-functions-audit.md — Needs Investigation List.
  protected createSelectionView() {
    // needs clarification
  }

  protected onSelectionMove() {
    // needs clarification
  }

  protected updateSelectionViewParams() {
    // needs clarification
  }

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
