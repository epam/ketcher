import {
  CoordinateTransformation,
  Scale,
  Vec2,
  fromRasterImageCreation,
  Editor,
} from 'ketcher-core';
import { Tool } from './Tool';

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
    this.element.onchange = null;
    if (this.element.files && this.element.files[0]) {
      const image = new Image();
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        image.src = reader.result as string;
      });

      image.onload = () => {
        const centerOffset = new Vec2(image.width / 2, image.height / 2);
        const startOffset = Scale.canvasToModel(
          centerOffset.negated(),
          this.editor.render.options,
        );
        const endOffset = Scale.canvasToModel(
          centerOffset,
          this.editor.render.options,
        );

        this.editor.update(
          fromRasterImageCreation(this.editor.render.ctab, image.src, [
            clickPosition.add(startOffset),
            clickPosition.add(endOffset),
          ]),
        );
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
    if (element) {
      if (element instanceof HTMLInputElement) {
        return element;
      }
      element.remove();
    }
    return this.createElement();
  }
}
