import Editor from '../../Editor';
import { CoordinateTransformation, CoreEditor, Vec2 } from 'ketcher-core';

export abstract class ArrowTool {
  // eslint-disable-next-line no-useless-constructor
  constructor(protected readonly editor: Editor) {}

  protected get render() {
    return this.editor.render;
  }

  protected get reStruct() {
    return this.render.ctab;
  }

  protected getOffset(event: PointerEvent, original: Vec2): Vec2 {
    return CoordinateTransformation.pageToModel(event, this.render).sub(
      original,
    );
  }

  protected updateCoreArrowResizingState(arrowId: number, isResizing: boolean) {
    const coreArrow =
      CoreEditor.provideEditorInstance()?.drawingEntitiesManager.rxnArrows.get(
        arrowId,
      );

    if (coreArrow && 'isResizing' in coreArrow) {
      coreArrow.isResizing = isResizing;
    }
  }
}
