import type { ClosestItemWithMap } from '../shared/closest.types';
import {
  type ImageReferencePositionInfo,
  CoordinateTransformation,
  type Vec2,
  fromImageCreation,
  Action,
  IMAGE_KEY,
  fromImageMove,
  fromImageResize,
} from 'ketcher-core';
import type { Tool } from './Tool';
import type Editor from '../Editor';
import { handleMovingPosibilityCursor } from '../utils';
import { getItemCursor } from '../utils/getItemCursor';
import { SUPPORTED_IMAGE_MIMES, readImageFile } from './imageFile';

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

  mousedown(event: MouseEvent) {
    const render = this.editor.render;
    const closestItem = this.editor.findItem(event, [
      IMAGE_KEY,
    ]) as ClosestItemWithMap<ImageReferencePositionInfo>;
    this.editor.selection(null);

    if (closestItem) {
      this.editor.hover(null);
      this.editor.selection({ [IMAGE_KEY]: [closestItem.id] });
      this.dragCtx = {
        center: CoordinateTransformation.pageToModel(event, render),
        action: new Action(),
        closestItem,
      };
    }
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

  onFileUpload(clickPosition: Vec2): void {
    this.element.onchange = null;
    const file = this.element.files?.[0];
    if (!file) {
      return;
    }

    readImageFile(file, this.editor.render.options)
      .then(({ src, halfSize }) => {
        this.editor.update(
          fromImageCreation(
            this.editor.render.ctab,
            src,
            clickPosition,
            halfSize,
          ),
        );
      })
      .catch((error: Error) => this.editor.errorHandler?.(error.message))
      .finally(() => this.resetElementValue());
  }

  private createElement(): HTMLInputElement {
    const uploader = document.createElement('input');
    uploader.style.display = 'none';
    uploader.id = ImageTool.INPUT_ID;
    uploader.type = 'file';
    uploader.accept = SUPPORTED_IMAGE_MIMES.join(',');
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
}
