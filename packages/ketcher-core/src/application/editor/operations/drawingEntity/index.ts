import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { BaseBond } from 'domain/entities/BaseBond';
export class DrawingEntityHoverOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.hoverDrawingEntity(this.drawingEntity);
  }

  public invert() {}
}

export class DrawingEntitySelectOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.selectDrawingEntity(this.drawingEntity);
  }

  public invert() {}
}
export class DrawingEntityMoveOperation implements Operation {
  private wasInverted = false;
  constructor(
    private moveDrawingEntityChangeModel: () => void,
    private invertMoveDrawingEntityChangeModel: () => void,
    private redoDrawingEntityChangeModel: () => void,
    private drawingEntity: DrawingEntity,
  ) {}

  public execute() {
    this.wasInverted
      ? this.redoDrawingEntityChangeModel()
      : this.moveDrawingEntityChangeModel();
  }

  public invert(renderersManager: RenderersManager) {
    this.invertMoveDrawingEntityChangeModel();

    if (this.drawingEntity instanceof BaseBond) {
      renderersManager.redrawDrawingEntity(this.drawingEntity);
    } else {
      renderersManager.moveDrawingEntity(this.drawingEntity);
    }

    this.wasInverted = true;
  }

  public executeAfterAllOperations(renderersManager: RenderersManager) {
    // Redraw Polymer bonds instead of moving needed here because
    // they have two drawing modes: straight and curved.
    // During switching snake/flex layout modes and undo/redo
    // we need to redraw them to apply the correct drawing mode.
    if (this.drawingEntity instanceof BaseBond) {
      renderersManager.redrawDrawingEntity(this.drawingEntity);
    } else {
      renderersManager.moveDrawingEntity(this.drawingEntity);
    }
  }
}

export class DrawingEntityRedrawOperation implements Operation {
  constructor(
    private drawingEntityRedrawModelChange: () => DrawingEntity,
    private invertDrawingEntityRedrawModelChange: () => DrawingEntity,
  ) {}

  public execute(renderersManager: RenderersManager) {
    const drawingEntity = this.drawingEntityRedrawModelChange();
    renderersManager.redrawDrawingEntity(drawingEntity, true);
  }

  public invert(renderersManager: RenderersManager) {
    const drawingEntity = this.invertDrawingEntityRedrawModelChange();
    renderersManager.redrawDrawingEntity(drawingEntity, true);
  }
}
