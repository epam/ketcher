import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { Operation } from 'domain/entities/Operation';
import type { CoreImage, CoreImageState } from 'domain/entities/CoreImage';

export class ImageAddOperation implements Operation {
  public image: CoreImage;
  public priority = 2;

  constructor(
    public addImageChangeModel: (image?: CoreImage) => CoreImage,
    public deleteImageChangeModel: (image: CoreImage) => void,
  ) {
    this.image = this.addImageChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.image = this.addImageChangeModel(this.image);
    renderersManager.addImage(this.image);
  }

  public invert(renderersManager: RenderersManager) {
    this.deleteImageChangeModel(this.image);
    renderersManager.deleteImage(this.image);
  }
}

export class ImageDeleteOperation implements Operation {
  public priority = 2;

  constructor(
    public image: CoreImage,
    public deleteImageChangeModel: (image: CoreImage) => void,
    public addImageChangeModel: (image: CoreImage) => CoreImage,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteImageChangeModel(this.image);
    renderersManager.deleteImage(this.image);
  }

  public invert(renderersManager: RenderersManager) {
    this.addImageChangeModel(this.image);
    renderersManager.addImage(this.image);
  }
}

export class ImageStateOperation implements Operation {
  constructor(
    public image: CoreImage,
    public fromState: CoreImageState,
    public toState: CoreImageState,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.image.setState(this.toState);
    renderersManager.redrawDrawingEntity(this.image);
  }

  public invert(renderersManager: RenderersManager) {
    this.image.setState(this.fromState);
    renderersManager.redrawDrawingEntity(this.image);
  }
}
