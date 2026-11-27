import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { Operation } from 'domain/entities/Operation';
import type { CoreSimpleObject } from 'domain/entities/CoreSimpleObject';
import type { Vec2 } from 'domain/entities/vec2';

export class SimpleObjectAddOperation implements Operation {
  public simpleObject: CoreSimpleObject;
  public priority = 2;

  constructor(
    public addSimpleObjectChangeModel: (
      simpleObject?: CoreSimpleObject,
    ) => CoreSimpleObject,
    public deleteSimpleObjectChangeModel: (
      simpleObject: CoreSimpleObject,
    ) => void,
  ) {
    this.simpleObject = this.addSimpleObjectChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.simpleObject = this.addSimpleObjectChangeModel(this.simpleObject);
    renderersManager.addSimpleObject(this.simpleObject);
  }

  public invert(renderersManager: RenderersManager) {
    if (!this.simpleObject) {
      return;
    }

    this.deleteSimpleObjectChangeModel(this.simpleObject);
    renderersManager.deleteSimpleObject(this.simpleObject);
  }
}

export class SimpleObjectDeleteOperation implements Operation {
  public priority = 2;

  constructor(
    public simpleObject: CoreSimpleObject,
    public deleteSimpleObjectChangeModel: (
      simpleObject: CoreSimpleObject,
    ) => void,
    public addSimpleObjectChangeModel: (
      simpleObject: CoreSimpleObject,
    ) => CoreSimpleObject,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteSimpleObjectChangeModel(this.simpleObject);
    renderersManager.deleteSimpleObject(this.simpleObject);
  }

  public invert(renderersManager: RenderersManager) {
    this.addSimpleObjectChangeModel(this.simpleObject);
    renderersManager.addSimpleObject(this.simpleObject);
  }
}

export class SimpleObjectTransformOperation implements Operation {
  constructor(
    public simpleObject: CoreSimpleObject,
    public fromPoints: [Vec2, Vec2],
    public toPoints: [Vec2, Vec2],
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.simpleObject.setPoints(this.toPoints);
    renderersManager.redrawDrawingEntity(this.simpleObject);
  }

  public invert(renderersManager: RenderersManager) {
    this.simpleObject.setPoints(this.fromPoints);
    renderersManager.redrawDrawingEntity(this.simpleObject);
  }
}
