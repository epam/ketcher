import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type {
  CoreStaticObject,
  StaticObjectContent,
} from 'domain/entities/CoreStaticObject';
import type { Operation } from 'domain/entities/Operation';

export class StaticObjectAddOperation implements Operation {
  public staticObject: CoreStaticObject;
  public priority = 2;

  constructor(
    public addStaticObjectChangeModel: (
      staticObject?: CoreStaticObject,
    ) => CoreStaticObject,
    public deleteStaticObjectChangeModel: (
      staticObject: CoreStaticObject,
    ) => void,
  ) {
    this.staticObject = this.addStaticObjectChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.staticObject = this.addStaticObjectChangeModel(this.staticObject);
    renderersManager.addStaticObject(this.staticObject);
  }

  public invert(renderersManager: RenderersManager) {
    this.deleteStaticObjectChangeModel(this.staticObject);
    renderersManager.deleteStaticObject(this.staticObject);
  }
}

export class StaticObjectDeleteOperation implements Operation {
  public priority = 2;

  constructor(
    public staticObject: CoreStaticObject,
    public deleteStaticObjectChangeModel: (
      staticObject: CoreStaticObject,
    ) => void,
    public addStaticObjectChangeModel: (
      staticObject: CoreStaticObject,
    ) => CoreStaticObject,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteStaticObjectChangeModel(this.staticObject);
    renderersManager.deleteStaticObject(this.staticObject);
  }

  public invert(renderersManager: RenderersManager) {
    this.addStaticObjectChangeModel(this.staticObject);
    renderersManager.addStaticObject(this.staticObject);
  }
}

export class StaticObjectContentOperation implements Operation {
  constructor(
    public staticObject: CoreStaticObject,
    private readonly previousContent: StaticObjectContent,
    private readonly nextContent: StaticObjectContent,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.staticObject.setContent(this.nextContent);
    renderersManager.redrawDrawingEntity(this.staticObject);
  }

  public invert(renderersManager: RenderersManager) {
    this.staticObject.setContent(this.previousContent);
    renderersManager.redrawDrawingEntity(this.staticObject);
  }
}
