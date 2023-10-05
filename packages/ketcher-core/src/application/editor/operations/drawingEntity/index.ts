import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';
import { DrawingEntity } from 'domain/entities/DrawingEntity';

export class DrawingEntityHoverOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.hoverDrawingEntity(this.drawingEntity);
  }
}

export class DrawingEntitySelectOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.selectDrawingEntity(this.drawingEntity);
  }
}
export class DrawingEntityMoveOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.moveDrawingEntity(this.drawingEntity);
  }
}
export class DrawingEntityRedrawOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.redrawDrawingEntity(this.drawingEntity);
  }
}
