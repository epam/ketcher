import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { Operation } from 'domain/entities/Operation';
import type { CoreSimpleObject } from 'domain/entities/CoreSimpleObject';

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
