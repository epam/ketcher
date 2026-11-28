import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';
import { createShapeDrawSession } from '../drawSession';

const NO_SHIFT = { shift: false };
const SHIFT = { shift: true };

describe('createShapeDrawSession', () => {
  it('creates nothing when the pointer never moved', () => {
    const session = createShapeDrawSession(
      SimpleObjectMode.rectangle,
      new Vec2(1, 1),
    );

    expect(session.finish(new Vec2(1, 1), NO_SHIFT)).toBeNull();
  });

  it('previews and finishes from the press point to the pointer', () => {
    const session = createShapeDrawSession(
      SimpleObjectMode.line,
      new Vec2(0, 0),
    );

    const preview = session.update(new Vec2(2, 1), NO_SHIFT);
    const result = session.finish(new Vec2(3, 1), NO_SHIFT);

    expect([preview.end.x, preview.end.y]).toEqual([2, 1]);
    expect(result?.kind).toBe(SimpleObjectMode.line);
    expect([result?.start.x, result?.start.y]).toEqual([0, 0]);
    expect([result?.end.x, result?.end.y]).toEqual([3, 1]);
  });

  it('constrains an ellipse preview to a circle with shift', () => {
    const session = createShapeDrawSession(
      SimpleObjectMode.ellipse,
      new Vec2(0, 0),
    );

    const preview = session.update(new Vec2(4, 2), SHIFT);

    expect([preview.end.x, preview.end.y]).toEqual([2, 2]);
  });

  it('keeps the legacy unconstrained preview for rectangles with shift', () => {
    const session = createShapeDrawSession(
      SimpleObjectMode.rectangle,
      new Vec2(0, 0),
    );

    const preview = session.update(new Vec2(4, 2), SHIFT);

    expect([preview.end.x, preview.end.y]).toEqual([4, 2]);
  });

  it.each([SimpleObjectMode.rectangle, SimpleObjectMode.line])(
    'constrains the final %s to equal sides with shift',
    (kind) => {
      const session = createShapeDrawSession(kind, new Vec2(0, 0));
      session.update(new Vec2(4, 2), SHIFT);

      const result = session.finish(new Vec2(4, 2), SHIFT);

      expect([result?.end.x, result?.end.y]).toEqual([2, 2]);
    },
  );
});
