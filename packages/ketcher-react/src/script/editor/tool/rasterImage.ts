import {
  CoordinateTransformation,
  Scale,
  Vec2,
  fromRasterImageCreation,
  Editor,
  KetcherLogger,
} from 'ketcher-core';
import { Tool } from './Tool';

const TAG = 'tool/rasterImage.ts';
const allowList = /image\/(png|jpeg|bmp|webp|x-icon|svg\+xml)/;
const MIN_DIMENSION_SIZE = 16;

export class RasterImageTool implements Tool {
  static readonly INPUT_ID = 'image-upload';
  private element: HTMLInputElement;

  constructor(private readonly editor: Editor) {
    this.element = this.getElement();
  }

  click(event: MouseEvent) {
    const position = CoordinateTransformation.pageToModel(
      event,
      this.editor.render,
    );
    this.element.onchange = this.onFileUpload.bind(this, position);
    this.element.click();
  }

  // We need to create empty function otherwise there will be errors in the console.
  mousemove() {
    // Empty for now
  }

  onFileUpload(clickPosition: Vec2): void {
    const errorHandler = this.editor.errorHandler;
    this.element.onchange = null;
    if (this.element.files && this.element.files[0]) {
      const file = this.element.files[0];
      const image = new Image();
      const reader = new FileReader();

      if (!file.type.match(allowList)) {
        const errorMesssage = `Wrong mime type: ${file.type}`;
        KetcherLogger.error(`${TAG}:onFileUpload`, errorMesssage);
        if (errorHandler) {
          errorHandler(errorMesssage);
        }

        this.resetElementValue();
        return;
      }

      reader.addEventListener('load', () => {
        image.src = reader.result as string;
      });

      image.onload = () => {
        this.resetElementValue();
        if (
          image.width < MIN_DIMENSION_SIZE ||
          image.height < MIN_DIMENSION_SIZE
        ) {
          const errorMessage =
            'Image should have be at least 16px wide and 16px tall';
          KetcherLogger.error(`${TAG}:onLoad`, errorMessage);
          if (errorHandler) {
            errorHandler(errorMessage);
          }
          return;
        }

        const halfSize = Scale.canvasToModel(
          new Vec2(image.width / 2, image.height / 2),
          this.editor.render.options,
        );

        this.editor.update(
          fromRasterImageCreation(
            this.editor.render.ctab,
            image.src,
            clickPosition,
            halfSize,
          ),
        );
      };

      image.onerror = (e) => {
        this.resetElementValue();
        const errorMessage = 'Cannot load image';
        KetcherLogger.error(`${TAG}:onerror`, errorMessage, e);
        if (errorHandler) {
          errorHandler(errorMessage);
        }
      };

      reader.readAsDataURL(this.element.files[0]);
    }
  }

  private createElement(): HTMLInputElement {
    const uploader = document.createElement('input');
    uploader.style.display = 'none';
    uploader.id = RasterImageTool.INPUT_ID;
    uploader.type = 'file';
    uploader.accept = 'image/*';
    document.body.appendChild(uploader);
    return uploader;
  }

  private getElement(): HTMLInputElement {
    const element = document.getElementById(RasterImageTool.INPUT_ID);

    if (element instanceof HTMLInputElement) {
      return element;
    }
    element?.remove();
    return this.createElement();
  }

  private resetElementValue(): void {
    this.getElement().value = '';
  }
}
