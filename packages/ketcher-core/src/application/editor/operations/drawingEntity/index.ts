import { RenderersManagerBase } from 'application/render/renderers/RenderersManagerBase';
import { Operation } from 'domain/entities/Operation';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { BaseBond } from 'domain/entities/BaseBond';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { MultitailArrow } from 'domain/entities/CoreMultitailArrow';
import { RxnPlus } from 'domain/entities/CoreRxnPlus';
export class DrawingEntityHoverOperation implements Operation {
  constructor(private readonly drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManagerBase) {
    renderersManager.hoverDrawingEntity(this.drawingEntity);
  }

  public invert() {}
}

export class DrawingEntitySelectOperation implements Operation {
  constructor(
    private readonly drawingEntity: DrawingEntity,
    private readonly selectDrawingEntitiesModelChange?: () => void,
  ) {}

  public execute() {
    if (this.selectDrawingEntitiesModelChange) {
      this.selectDrawingEntitiesModelChange();
    }
  }

  public executeAfterAllOperations(renderersManager: RenderersManagerBase) {
    renderersManager.selectDrawingEntity(this.drawingEntity);
  }

  public invert() {}
}
export class DrawingEntityMoveOperation implements Operation {
  private wasInverted = false;
  constructor(
    private readonly moveDrawingEntityChangeModel: () => void,
    private readonly invertMoveDrawingEntityChangeModel: () => void,
    private readonly redoDrawingEntityChangeModel: () => void,
    private readonly drawingEntity: DrawingEntity,
  ) {}

  public execute() {
    this.wasInverted
      ? this.redoDrawingEntityChangeModel()
      : this.moveDrawingEntityChangeModel();
  }

  public invert() {
    this.invertMoveDrawingEntityChangeModel();
    this.wasInverted = true;
  }

  public executeAfterAllOperations(renderersManager: RenderersManagerBase) {
    // Redraw Polymer bonds instead of moving needed here because
    // they have two drawing modes: straight and curved.
    // During switching snake/flex layout modes and undo/redo
    // we need to redraw them to apply the correct drawing mode.
    if (
      this.drawingEntity instanceof BaseBond ||
      this.drawingEntity instanceof RxnArrow ||
      this.drawingEntity instanceof MultitailArrow ||
      this.drawingEntity instanceof RxnPlus
    ) {
      renderersManager.redrawDrawingEntity(this.drawingEntity);
    } else {
      renderersManager.moveDrawingEntity(this.drawingEntity);
    }
  }

  public invertAfterAllOperations(renderersManager: RenderersManagerBase) {
    if (
      this.drawingEntity instanceof BaseBond ||
      this.drawingEntity instanceof RxnArrow ||
      this.drawingEntity instanceof MultitailArrow ||
      this.drawingEntity instanceof RxnPlus
    ) {
      renderersManager.redrawDrawingEntity(this.drawingEntity);
    } else {
      renderersManager.moveDrawingEntity(this.drawingEntity);
    }
  }
}

export class DrawingEntityRedrawOperation implements Operation {
  constructor(
    private readonly drawingEntityRedrawModelChange: () => DrawingEntity,
    private readonly invertDrawingEntityRedrawModelChange: () => DrawingEntity,
  ) {}

  public execute(renderersManager: RenderersManagerBase) {
    const drawingEntity = this.drawingEntityRedrawModelChange();
    renderersManager.redrawDrawingEntity(drawingEntity, true);
  }

  public invert(renderersManager: RenderersManagerBase) {
    const drawingEntity = this.invertDrawingEntityRedrawModelChange();
    renderersManager.redrawDrawingEntity(drawingEntity, true);
  }
}
