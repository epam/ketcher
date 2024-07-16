import {
  CoordinateTransformation,
  Scale,
  Vec2,
  fromRasterImageCreation,
  KetcherLogger,
  Action,
  RASTER_IMAGE_KEY,
  fromRasterImageMove,
  fromRasterImageResize,
  RasterImageReferencePositionInfo,
  rasterImageReferencePositionToCursor,
} from 'ketcher-core';
import { Tool } from './Tool';
import type Editor from '../Editor';
import { ClosestItemWithMap } from '../shared/closest.types';
import { handleMovingPosibilityCursor } from '../utils';

const TAG = 'tool/rasterImage.ts';
const allowList = /^image\/(png|jpeg|gif|bmp|webp|x-icon|svg\+xml)$/;
const MIN_DIMENSION_SIZE = 16;

interface DragContext {
  center: Vec2;
  action: Action;
  closestItem: ClosestItemWithMap<RasterImageReferencePositionInfo>;
}

export class RasterImageTool implements Tool {
  static readonly INPUT_ID = 'image-upload';
  private element: HTMLInputElement;
  private dragCtx: DragContext | null = null;

  constructor(private readonly editor: Editor) {
    this.element = this.getElement();
  }

  mousedown(event: MouseEvent) {
    const render = this.editor.render;
    const closestItem = this.editor.findItem(event, [
      RASTER_IMAGE_KEY,
    ]) as ClosestItemWithMap<RasterImageReferencePositionInfo>;
    this.editor.selection(null);

    if (closestItem) {
      this.editor.hover(null);
      this.editor.selection({ [RASTER_IMAGE_KEY]: [closestItem.id] });
      this.dragCtx = {
        center: CoordinateTransformation.pageToModel(event, render),
        action: new Action(),
        closestItem,
      };
    }
  }

  click(event: MouseEvent) {
    const closestItem = this.editor.findItem(event, [RASTER_IMAGE_KEY]);
    this.editor.hover(null);
    if (closestItem) {
      return;
    }

    const position = CoordinateTransformation.pageToModel(
      event,
      this.editor.render,
    );
    this.element.onchange = this.onFileUpload.bind(this, position);
    this.element.click();
  }

  // We need to create empty function otherwise there will be errors in the console.
  mousemove(event: PointerEvent) {
    const render = this.editor.render;
    if (this.dragCtx) {
      this.dragCtx.action.perform(render.ctab);
      const click = CoordinateTransformation.pageToModel(event, render);

      this.dragCtx.action = this.dragCtx.closestItem.ref
        ? fromRasterImageResize(
            render.ctab,
            this.dragCtx.closestItem.id,
            click,
            this.dragCtx.closestItem.ref,
          )
        : fromRasterImageMove(
            render.ctab,
            this.dragCtx.closestItem.id,
            click.sub(this.dragCtx.center),
          );
      this.editor.update(this.dragCtx.action, true);
    } else {
      const item = this.editor.findItem(event, [
        RASTER_IMAGE_KEY,
      ]) as ClosestItemWithMap<RasterImageReferencePositionInfo>;
      const render = this.editor.render;

      if (item?.ref) {
        handleMovingPosibilityCursor(
          item,
          render.paper.canvas,
          rasterImageReferencePositionToCursor[item.ref.name],
        );
      } else {
        handleMovingPosibilityCursor(
          item,
          render.paper.canvas,
          render.options.movingStyle.cursor as string,
        );
      }

      this.editor.hover(item, null, event);
    }
  }

  mouseup() {
    if (this.dragCtx) {
      this.editor.update(this.dragCtx.action);
      this.dragCtx = null;
    }
    return true;
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
