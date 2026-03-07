import Editor from '../../Editor';
import { CoordinateTransformation, CoreEditor, Vec2 } from 'ketcher-core';

function isResizableCoreArrow(
  arrow: unknown,
): arrow is { isResizing: boolean } {
  return (
    arrow !== null &&
    typeof arrow === 'object' &&
    'isResizing' in arrow &&
    typeof arrow.isResizing === 'boolean'
  );
}

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

    if (isResizableCoreArrow(coreArrow)) {
      coreArrow.isResizing = isResizing;
    }
  }
}
