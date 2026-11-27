import type { BaseRenderer } from 'application/render';
import type { StaticObjectRenderer } from 'application/render/renderers/StaticObjectRenderer';
import type { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Image } from 'domain/entities/image';
import { SimpleObject } from 'domain/entities/simpleObject';
import { Text } from 'domain/entities/text';
import { Vec2 } from 'domain/entities/vec2';
import {
  boxFromPoints,
  getBoundingBox,
  moveShape,
} from 'domain/staticObjects/geometry';
import type { Box, ShapeGeometry } from 'domain/staticObjects/types';

export type StaticObjectContent =
  | { readonly type: 'shape'; readonly geometry: ShapeGeometry }
  | {
      readonly type: 'text';
      readonly content: string;
      readonly position: Vec2;
      readonly pos: ReadonlyArray<Vec2>;
    }
  | { readonly type: 'image'; readonly bitmap: string; readonly box: Box };

export type StructStaticObject = SimpleObject | Text | Image;

function moveBox(box: Box, delta: Vec2): Box {
  return { min: box.min.add(delta), max: box.max.add(delta) };
}

export class CoreStaticObject extends DrawingEntity {
  public renderer?: StaticObjectRenderer = undefined;

  constructor(
    public content: StaticObjectContent,
    public initiallySelected?: initiallySelectedType,
  ) {
    super();
  }

  static fromStructEntity(entity: StructStaticObject): CoreStaticObject {
    if (entity instanceof SimpleObject) {
      return new CoreStaticObject(
        { type: 'shape', geometry: entity.geometry },
        entity.initiallySelected,
      );
    }
    if (entity instanceof Text) {
      return new CoreStaticObject(
        {
          type: 'text',
          content: entity.content,
          position: new Vec2(entity.position),
          pos: entity.pos.map((point) => new Vec2(point)),
        },
        entity.initiallySelected,
      );
    }
    return new CoreStaticObject(
      {
        type: 'image',
        bitmap: entity.bitmap,
        box: {
          min: entity.getTopLeftPosition(),
          max: entity.getBottomRightPosition(),
        },
      },
      entity.initiallySelected,
    );
  }

  toStructEntity(): StructStaticObject {
    const { content } = this;
    switch (content.type) {
      case 'shape':
        return new SimpleObject({
          mode: content.geometry.kind,
          pos: [content.geometry.start, content.geometry.end],
          initiallySelected: this.initiallySelected,
        });
      case 'text':
        return new Text({
          content: content.content,
          position: content.position,
          pos: [...content.pos],
          initiallySelected: this.initiallySelected,
        });
      case 'image': {
        const image = new Image(
          content.bitmap,
          Vec2.centre(content.box.min, content.box.max),
          Vec2.diff(content.box.max, content.box.min).scaled(0.5),
        );
        image.initiallySelected = this.initiallySelected;
        return image;
      }
    }
  }

  public get box(): Box {
    const { content } = this;
    switch (content.type) {
      case 'shape':
        return getBoundingBox(content.geometry);
      case 'text':
        return content.pos.length >= 3
          ? boxFromPoints(content.pos[0], content.pos[2])
          : { min: content.position, max: content.position };
      default:
        return content.box;
    }
  }

  public get center(): Vec2 {
    return Vec2.centre(this.box.min, this.box.max);
  }

  public setContent(content: StaticObjectContent): void {
    this.content = content;
  }

  public moved(delta: Vec2): StaticObjectContent {
    const { content } = this;
    switch (content.type) {
      case 'shape':
        return { type: 'shape', geometry: moveShape(content.geometry, delta) };
      case 'text':
        return {
          ...content,
          position: content.position.add(delta),
          pos: content.pos.map((point) => point.add(delta)),
        };
      case 'image':
        return { ...content, box: moveBox(content.box, delta) };
    }
  }

  public override moveRelative(delta: Vec2): void {
    this.content = this.moved(delta);
  }

  public override moveAbsolute(position: Vec2): void {
    this.moveRelative(Vec2.diff(position, this.box.min));
  }

  public setRenderer(renderer: StaticObjectRenderer): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }
}
