import { BaseMonomer, Vec2 } from 'domain/entities';
import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import {
  RotationViewParams,
  RotationView,
} from 'application/render/renderers/TransientView/RotationView';
import { Atom } from 'domain/entities/CoreAtom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { RxnArrowRenderer } from 'application/render/renderers/RxnArrowRenderer';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { getSnappedArrowVector } from 'application/editor/operations/rxn/RxnArrowResize';

export type SelectBaseMode =
  | 'moving'
  | 'selecting'
  | 'standby'
  | 'rotating'
  | 'rotating-center'
  | 'resizing-rxn-arrow';

export type RxnArrowResizeHandle = 'start' | 'end';

type RxnArrowResizeContext = {
  arrow: RxnArrow;
  handle: RxnArrowResizeHandle;
  initialStartPosition: Vec2;
  initialEndPosition: Vec2;
};

type RotationBoundingBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type BuildRotationViewParams = (
  center: Vec2,
  bbox: RotationBoundingBox,
) => RotationViewParams;

export class SelectBaseTransformHandler {
  public static readonly ROTATION_SNAP_ANGLE = 15;
  public static readonly ROTATION_ANGLE_EPSILON = 0.001;
  public static readonly RXN_ARROW_RESIZE_EPSILON = 0.001;
  public static readonly RXN_ARROW_HANDLE_SELECTION_RADIUS = 8;

  private rotationStartAngle = 0;
  private rotationCenter: Vec2 | null = null;
  private currentRotationAngle = 0;
  private rotationStartPositions = new Map<number, Vec2>();
  private userRotationCenter: Vec2 | null = null;
  private rxnArrowResizeContext: RxnArrowResizeContext | null = null;

  constructor(
    private readonly editor: CoreEditor,
    private readonly setMode: (mode: SelectBaseMode) => void,
    private readonly getMode: () => SelectBaseMode,
    private readonly buildRotationViewParams: BuildRotationViewParams,
  ) {}

  public subscribeToRotationControls(): [() => void, () => void] {
    const rotationHandleUnsubscribe = RotationView.subscribeRotationHandle(
      (payload) => {
        if (CoreEditor.provideEditorInstance().isSequenceAnyEditMode) return;
        if (this.getMode() === 'rotating') return;
        this.startRotation(payload.event);
      },
    );

    const rotationCenterUnsubscribe = RotationView.subscribeRotationCenter(
      (payload) => {
        if (CoreEditor.provideEditorInstance().isSequenceAnyEditMode) return;
        this.startRotationCenterDrag(payload.event);
      },
    );

    return [rotationHandleUnsubscribe, rotationCenterUnsubscribe];
  }

  public getUserRotationCenter() {
    return this.userRotationCenter;
  }

  public updateRotationView() {
    const selectedEntities =
      this.editor.drawingEntitiesManager.selectedEntitiesArr;
    const selectedMonomersAndAtoms = selectedEntities.filter(
      (entity) => entity instanceof BaseMonomer || entity instanceof Atom,
    );

    if (
      selectedMonomersAndAtoms.length < 2 ||
      this.editor.mode.modeName === 'sequence-layout-mode' ||
      (this.getMode() !== 'standby' && this.getMode() !== 'rotating-center')
    ) {
      this.editor.transientDrawingView.hideRotation();
      this.editor.transientDrawingView.update();
      return;
    }

    const bbox =
      this.editor.drawingEntitiesManager.getSelectedEntitiesBoundingBox();
    const center =
      this.userRotationCenter ??
      this.editor.drawingEntitiesManager.getSelectedEntitiesCenter();

    if (!bbox || !center) {
      this.editor.transientDrawingView.hideRotation();
      this.editor.transientDrawingView.update();
      return;
    }

    const viewParams = this.buildRotationViewParams(center, bbox);
    this.editor.transientDrawingView.showRotation(viewParams);
    this.editor.transientDrawingView.update();
  }

  public startRotation(event: MouseEvent | PointerEvent) {
    event.stopPropagation();
    event.preventDefault();

    this.setMode('rotating');
    this.rotationCenter =
      this.userRotationCenter ??
      this.editor.drawingEntitiesManager.getSelectedEntitiesCenter();

    if (!this.rotationCenter) {
      this.setMode('standby');
      this.rotationStartPositions.clear();
      return;
    }

    this.rotationStartPositions = new Map(
      this.editor.drawingEntitiesManager.selectedEntitiesArr.map((entity) => [
        entity.id,
        new Vec2(entity.position),
      ]),
    );

    const canvasCenter = Coordinates.modelToCanvas(this.rotationCenter);
    const cursorPos = this.editor.lastCursorPositionOfCanvas;
    this.rotationStartAngle = Math.atan2(
      cursorPos.y - canvasCenter.y,
      cursorPos.x - canvasCenter.x,
    );
    this.currentRotationAngle = 0;

    const bbox =
      this.editor.drawingEntitiesManager.getSelectedEntitiesBoundingBox();
    if (bbox) {
      const viewParams = this.buildRotationViewParams(
        this.rotationCenter,
        bbox,
      );
      this.editor.transientDrawingView.showRotation({
        ...viewParams,
        rotationAngle: 0,
        isRotating: true,
      });
      this.editor.transientDrawingView.update();
    }
  }

  public startRotationCenterDrag(event: MouseEvent | PointerEvent) {
    event.stopPropagation();
    event.preventDefault();

    if (
      this.editor.drawingEntitiesManager.externalConnectionsToSelection.length
    ) {
      return;
    }

    this.setMode('rotating-center');
    this.updateRotationCenterFromCursor();
  }

  public updateRotationCenterFromCursor() {
    const cursorCanvas = Coordinates.viewToCanvas(
      this.editor.lastCursorPosition,
    );
    this.userRotationCenter = Coordinates.canvasToModel(cursorCanvas);
    this.updateRotationView();
  }

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
      SelectBaseTransformHandler.RXN_ARROW_HANDLE_SELECTION_RADIUS;

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

  public handleRotationMove(event: MouseEvent) {
    if (!this.rotationCenter) return;

    const canvasCenter = Coordinates.modelToCanvas(this.rotationCenter);
    const cursorPos = this.editor.lastCursorPositionOfCanvas;

    const currentAngle = Math.atan2(
      cursorPos.y - canvasCenter.y,
      cursorPos.x - canvasCenter.x,
    );

    let angleDelta = currentAngle - this.rotationStartAngle;
    let angleDeltaDegrees = (angleDelta * 180) / Math.PI;

    if (!event.ctrlKey) {
      const snapAngle = SelectBaseTransformHandler.ROTATION_SNAP_ANGLE;
      angleDeltaDegrees = Math.round(angleDeltaDegrees / snapAngle) * snapAngle;
      angleDelta = (angleDeltaDegrees * Math.PI) / 180;
    }

    const incrementalDegrees = angleDeltaDegrees - this.currentRotationAngle;
    this.currentRotationAngle = angleDeltaDegrees;

    const modelChanges =
      this.editor.drawingEntitiesManager.rotateSelectedDrawingEntities(
        this.rotationCenter,
        incrementalDegrees,
        true,
      );

    requestAnimationFrame(() => {
      this.editor.renderersContainer.update(modelChanges);
      this.editor.drawingEntitiesManager.rerenderBondsOverlappedByMonomers();

      const bbox =
        this.editor.drawingEntitiesManager.getSelectedEntitiesBoundingBox();
      if (bbox && this.rotationCenter) {
        const viewParams = this.buildRotationViewParams(
          this.rotationCenter,
          bbox,
        );
        this.editor.transientDrawingView.showRotation({
          ...viewParams,
          rotationAngle: angleDelta,
          isRotating: true,
        });
        this.editor.transientDrawingView.update();
      }
    });
  }

  public finishRotation() {
    const history = EditorHistory.getInstance(this.editor);

    if (
      !this.rotationCenter ||
      Math.abs(this.currentRotationAngle) <
        SelectBaseTransformHandler.ROTATION_ANGLE_EPSILON
    ) {
      this.resetRotationState();
      this.updateRotationView();
      return;
    }

    const modelChanges =
      this.editor.drawingEntitiesManager.createRotationHistoryCommand(
        this.rotationStartPositions,
      );

    history.update(modelChanges);
    this.resetRotationState();
    this.updateRotationView();
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
      SelectBaseTransformHandler.RXN_ARROW_RESIZE_EPSILON;
    const hasEndChanged =
      currentEndPosition.sub(context.initialEndPosition).length() >
      SelectBaseTransformHandler.RXN_ARROW_RESIZE_EPSILON;

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

  public stopMovement() {
    this.setMode('standby');
    this.rxnArrowResizeContext = null;
    this.editor.transientDrawingView.clear();
  }

  private resetRotationState() {
    this.setMode('standby');
    this.rotationCenter = null;
    this.userRotationCenter = null;
    this.currentRotationAngle = 0;
    this.rotationStartPositions.clear();
    this.rxnArrowResizeContext = null;
  }
}
