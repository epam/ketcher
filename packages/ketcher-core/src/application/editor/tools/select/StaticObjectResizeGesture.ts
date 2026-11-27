import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import {
  STATIC_OBJECT_HANDLE_ATTRIBUTE,
  StaticObjectRenderer,
} from 'application/render/renderers/StaticObjectRenderer';
import type { Command } from 'domain/entities/Command';
import type {
  CoreStaticObject,
  StaticObjectContent,
} from 'domain/entities/CoreStaticObject';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import type { Vec2 } from 'domain/entities/vec2';
import {
  boxFromPoints,
  resizeBox,
  resizeShape,
} from 'domain/staticObjects/geometry';
import type { BoxHandle, Handle } from 'domain/staticObjects/types';

function resizeContent(
  content: StaticObjectContent,
  handle: Handle,
  pointer: Vec2,
): StaticObjectContent {
  switch (content.type) {
    case 'shape':
      return {
        type: 'shape',
        geometry: resizeShape(content.geometry, handle, pointer),
      };
    case 'image': {
      const { min, max } = resizeBox(content.box, handle as BoxHandle, pointer);
      return { ...content, box: boxFromPoints(min, max) };
    }
    default:
      return content;
  }
}

export class StaticObjectResizeGesture {
  private readonly initialContent: StaticObjectContent;

  private constructor(
    private readonly staticObject: CoreStaticObject,
    private readonly handle: Handle,
  ) {
    this.initialContent = staticObject.content;
  }

  static fromEvent(event: MouseEvent): StaticObjectResizeGesture | null {
    const target = event.target as (Element & { __data__?: unknown }) | null;
    const handle = target?.getAttribute?.(STATIC_OBJECT_HANDLE_ATTRIBUTE);
    const renderer = target?.__data__;

    if (!handle || !(renderer instanceof StaticObjectRenderer)) {
      return null;
    }

    return new StaticObjectResizeGesture(
      renderer.staticObject,
      handle as Handle,
    );
  }

  update(pointer: Vec2, renderersManager: RenderersManager) {
    this.staticObject.setContent(
      resizeContent(this.initialContent, this.handle, pointer),
    );
    renderersManager.redrawDrawingEntity(this.staticObject);
  }

  finish(drawingEntitiesManager: DrawingEntitiesManager): Command | null {
    if (this.staticObject.content === this.initialContent) {
      return null;
    }

    return drawingEntitiesManager.updateStaticObjectContent(
      this.staticObject,
      this.initialContent,
      this.staticObject.content,
    );
  }
}
