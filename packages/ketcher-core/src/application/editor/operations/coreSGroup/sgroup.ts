import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { Operation } from 'domain/entities/Operation';
import type { SGroupDrawingEntity } from 'domain/entities/SGroupDrawingEntity';

export class SGroupAddOperation implements Operation {
  public sgroupDrawingEntity: SGroupDrawingEntity;
  public priority = 2;

  constructor(
    public addSGroupChangeModel: (
      sgroupDrawingEntity?: SGroupDrawingEntity,
    ) => SGroupDrawingEntity,
    public deleteSGroupChangeModel: (
      sgroupDrawingEntity: SGroupDrawingEntity,
    ) => void,
  ) {
    this.sgroupDrawingEntity = this.addSGroupChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.sgroupDrawingEntity = this.addSGroupChangeModel(
      this.sgroupDrawingEntity,
    );
    renderersManager.addSGroup(this.sgroupDrawingEntity);
  }

  public invert(renderersManager: RenderersManager) {
    this.deleteSGroupChangeModel(this.sgroupDrawingEntity);
    renderersManager.deleteSGroup(this.sgroupDrawingEntity);
  }
}

export class SGroupDeleteOperation implements Operation {
  public priority = 2;

  constructor(
    public sgroupDrawingEntity: SGroupDrawingEntity,
    public deleteSGroupChangeModel: (
      sgroupDrawingEntity: SGroupDrawingEntity,
    ) => void,
    public addSGroupChangeModel: (
      sgroupDrawingEntity: SGroupDrawingEntity,
    ) => SGroupDrawingEntity,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteSGroupChangeModel(this.sgroupDrawingEntity);
    renderersManager.deleteSGroup(this.sgroupDrawingEntity);
  }

  public invert(renderersManager: RenderersManager) {
    this.addSGroupChangeModel(this.sgroupDrawingEntity);
    renderersManager.addSGroup(this.sgroupDrawingEntity);
  }
}
