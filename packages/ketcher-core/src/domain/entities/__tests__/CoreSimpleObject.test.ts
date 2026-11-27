import { Vec2 } from 'domain/entities/vec2';
import { CoreSimpleObject } from 'domain/entities/CoreSimpleObject';
import { SimpleObjectMode } from 'domain/entities/simpleObject';

describe('CoreSimpleObject', () => {
  it('uses the first point as position and the midpoint as center', () => {
    const object = new CoreSimpleObject(
      SimpleObjectMode.rectangle,
      new Vec2(0, 0),
      new Vec2(4, 2),
    );

    expect(object.position).toEqual(new Vec2(0, 0));
    expect(object.center).toEqual(new Vec2(2, 1));
  });

  it('moveRelative shifts both points and the position', () => {
    const object = new CoreSimpleObject(
      SimpleObjectMode.line,
      new Vec2(1, 1),
      new Vec2(3, 5),
    );

    object.moveRelative(new Vec2(2, -1));

    expect(object.pos[0]).toEqual(new Vec2(3, 0));
    expect(object.pos[1]).toEqual(new Vec2(5, 4));
    expect(object.position).toEqual(new Vec2(3, 0));
  });

  it('moveAbsolute places the first point and keeps the shape', () => {
    const object = new CoreSimpleObject(
      SimpleObjectMode.ellipse,
      new Vec2(0, 0),
      new Vec2(2, 2),
    );

    object.moveAbsolute(new Vec2(10, 10));

    expect(object.position).toEqual(new Vec2(10, 10));
    expect(object.pos[1]).toEqual(new Vec2(12, 12));
  });
});
