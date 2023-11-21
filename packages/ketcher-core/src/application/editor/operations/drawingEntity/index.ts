// eslint-disable no-unused-vars
/* eslint-disable @typescript-eslint/no-unused-vars */

import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';
import { DrawingEntity } from 'domain/entities/DrawingEntity';

export class DrawingEntityHoverOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.hoverDrawingEntity(this.drawingEntity);
  }

  public invert(_renderersManager: RenderersManager) {
    console.log('invert DrawingEntityHoverOperation');
  }
}

export class DrawingEntitySelectOperation implements Operation {
  constructor(private drawingEntity: DrawingEntity) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.selectDrawingEntity(this.drawingEntity);
  }

  public invert(_renderersManager: RenderersManager) {
    console.log('invert DrawingEntitySelectOperation');
  }
}
export class DrawingEntityMoveOperation implements Operation {
  private wasInverted = false;
  constructor(
    private moveDrawingEntityChangeModel: () => void,
    private invertMoveDrawingEntityChangeModel: () => void,
    private redoDrawingEntityChangeModel: () => void,
    private drawingEntity: DrawingEntity,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.wasInverted
      ? this.redoDrawingEntityChangeModel()
      : this.moveDrawingEntityChangeModel();
    renderersManager.moveDrawingEntity(this.drawingEntity);
  }

  public invert(renderersManager: RenderersManager) {
    this.invertMoveDrawingEntityChangeModel();
    renderersManager.moveDrawingEntity(this.drawingEntity);
    this.wasInverted = true;
  }
}
export class DrawingEntityRedrawOperation implements Operation {
  constructor(
    private drawingEntityRedrawModelChange: () => DrawingEntity,
    private invertDrawingEntityRedrawModelChange: () => DrawingEntity,
  ) {}

  public execute(renderersManager: RenderersManager) {
    const drawingEntity = this.drawingEntityRedrawModelChange();
    renderersManager.redrawDrawingEntity(drawingEntity);
  }

  public invert(renderersManager: RenderersManager) {
    const drawingEntity = this.invertDrawingEntityRedrawModelChange();
    renderersManager.redrawDrawingEntity(drawingEntity);
  }
}
