import { CoreStaticObject } from 'domain/entities/CoreStaticObject';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Image } from 'domain/entities/image';
import { SimpleObject, SimpleObjectMode } from 'domain/entities/simpleObject';
import { Struct } from 'domain/entities/struct';
import { Text } from 'domain/entities/text';
import { Vec2 } from 'domain/entities/vec2';

const xy = (point: Vec2) => [point.x, point.y];

describe('CoreStaticObject', () => {
  it('round-trips a shape through the struct entity', () => {
    const source = new SimpleObject({
      mode: SimpleObjectMode.ellipse,
      pos: [new Vec2(0, 0), new Vec2(4, 2)],
      initiallySelected: true,
    });

    const result = CoreStaticObject.fromStructEntity(source).toStructEntity();

    expect(result).toBeInstanceOf(SimpleObject);
    expect((result as SimpleObject).mode).toBe(SimpleObjectMode.ellipse);
    expect((result as SimpleObject).pos.map(xy)).toEqual([
      [0, 0],
      [4, 2],
    ]);
    expect(result.initiallySelected).toBe(true);
  });

  it('round-trips a text through the struct entity', () => {
    const source = new Text({
      content: '{"root":{}}',
      position: new Vec2(1, 1),
      pos: [new Vec2(1, 1), new Vec2(1, 2), new Vec2(3, 2), new Vec2(3, 1)],
    });

    const result = CoreStaticObject.fromStructEntity(
      source,
    ).toStructEntity() as Text;

    expect(result.content).toBe('{"root":{}}');
    expect(xy(result.position)).toEqual([1, 1]);
    expect(result.pos.map(xy)).toEqual(source.pos.map(xy));
  });

  it('round-trips an image through the struct entity', () => {
    const source = new Image(
      'data:image/png;base64,AA==',
      new Vec2(2, 2),
      new Vec2(1, 0.5),
    );

    const result = CoreStaticObject.fromStructEntity(
      source,
    ).toStructEntity() as Image;

    expect(result.bitmap).toBe(source.bitmap);
    expect(xy(result.getTopLeftPosition())).toEqual([1, 1.5]);
    expect(xy(result.getBottomRightPosition())).toEqual([3, 2.5]);
  });

  it('moves every kind without mutating the previous content', () => {
    const shape = new CoreStaticObject({
      type: 'shape',
      geometry: {
        kind: SimpleObjectMode.line,
        start: new Vec2(0, 0),
        end: new Vec2(1, 1),
      },
    });
    const before = shape.content;

    shape.moveRelative(new Vec2(2, 3));

    expect(shape.content).not.toBe(before);
    expect(
      shape.content.type === 'shape' && xy(shape.content.geometry.end),
    ).toEqual([3, 4]);
    expect(xy(shape.center)).toEqual([2.5, 3.5]);
  });
});

describe('DrawingEntitiesManager.setMicromoleculesHiddenEntities', () => {
  it('does not keep static objects hidden, so they are not duplicated', () => {
    const struct = new Struct();
    struct.simpleObjects.add(
      new SimpleObject({
        mode: SimpleObjectMode.line,
        pos: [new Vec2(), new Vec2(1, 1)],
      }),
    );
    struct.texts.add(new Text({ content: '', position: new Vec2(), pos: [] }));
    const manager = new DrawingEntitiesManager();

    manager.setMicromoleculesHiddenEntities(struct);

    expect(manager.micromoleculesHiddenEntities.simpleObjects.size).toBe(0);
    expect(manager.micromoleculesHiddenEntities.texts.size).toBe(0);
    expect(manager.micromoleculesHiddenEntities.images.size).toBe(0);
  });
});
