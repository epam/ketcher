import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';
import { DrawingEntity } from 'domain/entities/DrawingEntity';

export class DrawingEntityHoverOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.hoverDrawingEntity(this.drawingEntity);
  }

  public invert(renderersManager: RenderersManager) {
    console.log('invert DrawingEntityHoverOperation');
  }
}

export class DrawingEntitySelectOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.selectDrawingEntity(this.drawingEntity);
  }

  public invert(renderersManager: RenderersManager) {
    console.log('invert DrawingEntitySelectOperation');
  }
}
export class DrawingEntityMoveOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.moveDrawingEntity(this.drawingEntity);
  }

  public invert(renderersManager: RenderersManager) {
    console.log('invert DrawingEntityMoveOperation');
  }
}
export class DrawingEntityRedrawOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.redrawDrawingEntity(this.drawingEntity);
  }

  public invert(renderersManager: RenderersManager) {
    console.log('invert DrawingEntityRedrawOperation');
  }
}
