import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { Operation } from 'domain/entities/Operation';
import type { CoreText, CoreTextState } from 'domain/entities/CoreText';

export class TextAddOperation implements Operation {
  public text: CoreText;
  public priority = 2;

  constructor(
    public addTextChangeModel: (text?: CoreText) => CoreText,
    public deleteTextChangeModel: (text: CoreText) => void,
  ) {
    this.text = this.addTextChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.text = this.addTextChangeModel(this.text);
    renderersManager.addText(this.text);
  }

  public invert(renderersManager: RenderersManager) {
    this.deleteTextChangeModel(this.text);
    renderersManager.deleteText(this.text);
  }
}

export class TextDeleteOperation implements Operation {
  public priority = 2;

  constructor(
    public text: CoreText,
    public deleteTextChangeModel: (text: CoreText) => void,
    public addTextChangeModel: (text: CoreText) => CoreText,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteTextChangeModel(this.text);
    renderersManager.deleteText(this.text);
  }

  public invert(renderersManager: RenderersManager) {
    this.addTextChangeModel(this.text);
    renderersManager.addText(this.text);
  }
}

export class TextStateOperation implements Operation {
  constructor(
    public text: CoreText,
    public fromState: CoreTextState,
    public toState: CoreTextState,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.text.setState(this.toState);
    renderersManager.redrawDrawingEntity(this.text);
  }

  public invert(renderersManager: RenderersManager) {
    this.text.setState(this.fromState);
    renderersManager.redrawDrawingEntity(this.text);
  }
}
