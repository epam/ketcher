import { Vec2 } from 'domain/entities';
import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { RxnArrowRenderer } from 'application/render/renderers/RxnArrowRenderer';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { Coordinates } from 'application/editor/shared/coordinates';
import { getSnappedArrowVector } from 'application/editor/operations/rxn/RxnArrowResize';
import { SelectBaseMode } from 'application/editor/tools/select/SelectBase.types';

export type RxnArrowResizeHandle = 'start' | 'end';

type RxnArrowResizeContext = {
  arrow: RxnArrow;
  handle: RxnArrowResizeHandle;
  initialStartPosition: Vec2;
  initialEndPosition: Vec2;
};

export class SelectBaseRxnArrowResizeHandler {
  private static readonly RXN_ARROW_RESIZE_EPSILON = 0.001;
  private static readonly RXN_ARROW_HANDLE_SELECTION_RADIUS = 8;

  private rxnArrowResizeContext: RxnArrowResizeContext | null = null;

  constructor(
    private readonly editor: CoreEditor,
    private readonly setMode: (mode: SelectBaseMode) => void,
  ) {}

  public getRxnArrowResizeHandle(
    renderer: BaseRenderer,
  ): RxnArrowResizeHandle | null {
    if (!(renderer instanceof RxnArrowRenderer)) {
      return null;
    }

    const selectionPoints = renderer.selectionPoints;
    if (!selectionPoints) {
      return null;
    }

    const [startPoint, endPoint] = selectionPoints;
    const cursorPosition = this.editor.lastCursorPositionOfCanvas;
    const threshold =
      SelectBaseRxnArrowResizeHandler.RXN_ARROW_HANDLE_SELECTION_RADIUS;

    if (Vec2.dist(cursorPosition, startPoint) <= threshold) {
      return 'start';
    }

    if (Vec2.dist(cursorPosition, endPoint) <= threshold) {
      return 'end';
    }

    return null;
  }

  public startRxnArrowResize(
    arrow: RxnArrow,
    handle: RxnArrowResizeHandle,
  ): void {
    this.setMode('resizing-rxn-arrow');
    this.rxnArrowResizeContext = {
      arrow,
      handle,
      initialStartPosition: new Vec2(arrow.startPosition),
      initialEndPosition: new Vec2(arrow.endPosition),
    };
  }

  public resizeRxnArrow(event: MouseEvent): void {
    const context = this.rxnArrowResizeContext;
    if (!context) {
      return;
    }

    const currentPosition = Coordinates.canvasToModel(
      this.editor.lastCursorPositionOfCanvas,
    );
    const fixedPosition =
      context.handle === 'start'
        ? context.initialEndPosition
        : context.initialStartPosition;
    const currentVector = currentPosition.sub(fixedPosition);
    const nextPosition = !event.ctrlKey
      ? fixedPosition.add(getSnappedArrowVector(currentVector))
      : currentPosition;

    if (context.handle === 'start') {
      context.arrow.startEndPosition = [new Vec2(nextPosition), fixedPosition];
    } else {
      context.arrow.startEndPosition = [fixedPosition, new Vec2(nextPosition)];
    }

    this.editor.renderersContainer.redrawDrawingEntity(context.arrow);
  }

  public finishRxnArrowResize() {
    const context = this.rxnArrowResizeContext;
    if (!context) {
      return;
    }

    const currentStartPosition = new Vec2(context.arrow.startPosition);
    const currentEndPosition = new Vec2(context.arrow.endPosition);
    const hasStartChanged =
      currentStartPosition.sub(context.initialStartPosition).length() >
      SelectBaseRxnArrowResizeHandler.RXN_ARROW_RESIZE_EPSILON;
    const hasEndChanged =
      currentEndPosition.sub(context.initialEndPosition).length() >
      SelectBaseRxnArrowResizeHandler.RXN_ARROW_RESIZE_EPSILON;

    if (!hasStartChanged && !hasEndChanged) {
      return;
    }

    const history = EditorHistory.getInstance(this.editor);
    const modelChanges =
      this.editor.drawingEntitiesManager.createDrawingEntityRedrawCommand(
        () => {
          context.arrow.startEndPosition = [
            new Vec2(currentStartPosition),
            new Vec2(currentEndPosition),
          ];

          return context.arrow;
        },
        () => {
          context.arrow.startEndPosition = [
            new Vec2(context.initialStartPosition),
            new Vec2(context.initialEndPosition),
          ];

          return context.arrow;
        },
      );

    history.update(modelChanges);
  }

  public clearContext() {
    this.rxnArrowResizeContext = null;
  }
}
