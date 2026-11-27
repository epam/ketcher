import type { ClosestItemWithMap } from '../shared/closest.types';
import {
  type ImageReferencePositionInfo,
  CoordinateTransformation,
  Scale,
  type Vec2,
  fromImageCreation,
  KetcherLogger,
  Action,
  IMAGE_KEY,
  fromImageMove,
  fromImageResize,
  IMAGE_VALIDATION_MESSAGES,
  SUPPORTED_IMAGE_MIME_TYPES,
} from 'ketcher-core';
import type { Tool } from './Tool';
import type Editor from '../Editor';
import { handleMovingPosibilityCursor } from '../utils';
import { getItemCursor } from '../utils/getItemCursor';
import { readImageFile } from '../utils/readImageFile';

const TAG = 'tool/image.ts';

interface DragContext {
  center: Vec2;
  action: Action;
  closestItem: ClosestItemWithMap<ImageReferencePositionInfo>;
}

export class ImageTool implements Tool {
  static readonly INPUT_ID = 'image-upload';
  private readonly element: HTMLInputElement;
  private dragCtx: DragContext | null = null;

  constructor(private readonly editor: Editor) {
    this.element = this.getElement();
  }

  private createElement(): HTMLInputElement {
    const uploader = document.createElement('input');
    uploader.style.display = 'none';
    uploader.id = ImageTool.INPUT_ID;
    uploader.type = 'file';
    uploader.accept = SUPPORTED_IMAGE_MIME_TYPES.join(',');
    document.body.appendChild(uploader);
    return uploader;
  }

  private getElement(): HTMLInputElement {
    const element = document.getElementById(ImageTool.INPUT_ID);

    if (element instanceof HTMLInputElement) {
      return element;
    }
    element?.remove();
    return this.createElement();
  }

  private resetElementValue(): void {
    this.getElement().value = '';
  }

  mousedown(event: MouseEvent) {
    const render = this.editor.render;
    const closestItem = this.editor.findItem(event, [
      IMAGE_KEY,
    ]) as ClosestItemWithMap<ImageReferencePositionInfo>;
    this.editor.selection(null);

    if (!closestItem) {
      return;
    }

    this.editor.hover(null);
    this.editor.selection({ [IMAGE_KEY]: [closestItem.id] });
    this.dragCtx = {
      center: CoordinateTransformation.pageToModel(event, render),
      action: new Action(),
      closestItem,
    };
  }

  click(event: MouseEvent) {
    const closestItem = this.editor.findItem(event, [IMAGE_KEY]);
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

  mousemove(event: PointerEvent) {
    const render = this.editor.render;
    if (this.dragCtx) {
      this.dragCtx.action.perform(render.ctab);
      const click = CoordinateTransformation.pageToModel(event, render);

      this.dragCtx.action = this.dragCtx.closestItem.ref
        ? fromImageResize(
            render.ctab,
            this.dragCtx.closestItem.id,
            click,
            this.dragCtx.closestItem.ref,
          )
        : fromImageMove(
            render.ctab,
            this.dragCtx.closestItem.id,
            click.sub(this.dragCtx.center),
          );
      this.editor.update(this.dragCtx.action, true);
    } else {
      const item = this.editor.findItem(event, [
        IMAGE_KEY,
      ]) as ClosestItemWithMap<ImageReferencePositionInfo>;
      const render = this.editor.render;
      handleMovingPosibilityCursor(
        item,
        render.paper.canvas,
        getItemCursor(render, item),
      );
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

  async onFileUpload(clickPosition: Vec2): Promise<void> {
    this.element.onchange = null;
    const file = this.element.files?.[0];
    if (!file) {
      return;
    }

    const result = await readImageFile(file);
    this.resetElementValue();

    if ('error' in result) {
      const errorMessage = IMAGE_VALIDATION_MESSAGES[result.error];
      KetcherLogger.error(
        `${TAG}:onFileUpload`,
        errorMessage,
        ...(result.cause === undefined ? [] : [result.cause]),
      );
      this.editor.errorHandler?.(errorMessage);
      return;
    }

    this.editor.update(
      fromImageCreation(
        this.editor.render.ctab,
        result.dataUrl,
        clickPosition,
        Scale.canvasToModel(result.halfSizePx, this.editor.render.options),
      ),
    );
  }
}
