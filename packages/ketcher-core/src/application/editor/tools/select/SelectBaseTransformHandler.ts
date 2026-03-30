import { CoreEditor } from 'application/editor/internal';
import { Vec2 } from 'domain/entities';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { RotationViewParams } from 'application/render/renderers/TransientView/RotationView';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { SelectBaseMode } from 'application/editor/tools/select/SelectBase.types';
import { SelectBaseRotationHandler } from 'application/editor/tools/select/SelectBaseRotationHandler';
import {
  RxnArrowResizeHandle,
  SelectBaseRxnArrowResizeHandler,
} from 'application/editor/tools/select/SelectBaseRxnArrowResizeHandler';

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
  private readonly rotationHandler: SelectBaseRotationHandler;
  private readonly rxnArrowResizeHandler: SelectBaseRxnArrowResizeHandler;

  constructor(
    private readonly editor: CoreEditor,
    setMode: (mode: SelectBaseMode) => void,
    getMode: () => SelectBaseMode,
    buildRotationViewParams: BuildRotationViewParams,
  ) {
    this.rotationHandler = new SelectBaseRotationHandler(
      this.editor,
      setMode,
      getMode,
      buildRotationViewParams,
    );
    this.rxnArrowResizeHandler = new SelectBaseRxnArrowResizeHandler(
      this.editor,
      setMode,
    );
  }

  public subscribeToRotationControls() {
    return this.rotationHandler.subscribeToRotationControls();
  }

  public getUserRotationCenter() {
    return this.rotationHandler.getUserRotationCenter();
  }

  public updateRotationView() {
    this.rotationHandler.updateRotationView();
  }

  public startRotation(event: MouseEvent | PointerEvent) {
    this.rxnArrowResizeHandler.clearContext();
    this.rotationHandler.startRotation(event);
  }

  public startRotationCenterDrag(event: MouseEvent | PointerEvent) {
    this.rxnArrowResizeHandler.clearContext();
    this.rotationHandler.startRotationCenterDrag(event);
  }

  public updateRotationCenterFromCursor() {
    this.rotationHandler.updateRotationCenterFromCursor();
  }

  public handleRotationMove(event: MouseEvent) {
    this.rotationHandler.handleRotationMove(event);
  }

  public finishRotation() {
    this.rotationHandler.finishRotation();
    this.rxnArrowResizeHandler.clearContext();
  }

  public getRxnArrowResizeHandle(renderer: BaseRenderer) {
    return this.rxnArrowResizeHandler.getRxnArrowResizeHandle(renderer);
  }

  public startRxnArrowResize(arrow: RxnArrow, handle: RxnArrowResizeHandle) {
    this.rxnArrowResizeHandler.startRxnArrowResize(arrow, handle);
  }

  public resizeRxnArrow(event: MouseEvent) {
    this.rxnArrowResizeHandler.resizeRxnArrow(event);
  }

  public finishRxnArrowResize() {
    this.rxnArrowResizeHandler.finishRxnArrowResize();
  }

  public stopMovement() {
    this.rxnArrowResizeHandler.clearContext();
    this.editor.transientDrawingView.clear();
  }
}
