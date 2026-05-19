import { Vec2 } from 'domain/entities/vec2';
import { Box2Abs } from 'domain/entities/box2Abs';

describe('clone', () => {
  it('should return clone', () => {
    const box2Abs = new Box2Abs();
    const box2AbsClone = box2Abs.clone();
    const p0 = new Vec2(box2Abs.p0);
    const p1 = new Vec2(box2Abs.p1);
    const p2 = box2AbsClone.p0;
    const p3 = box2AbsClone.p1;

    const isClone =
      box2Abs.clone() instanceof Box2Abs && p0.equals(p1) && p2.equals(p3);

    expect(isClone).toBeTruthy();
  });
});
