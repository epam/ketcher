import { Vec2 } from 'domain/entities/vec2';
import {
  getEllipseGeometry,
  getLineGeometry,
  getRectangleGeometry,
} from 'application/render/renderers/simpleObjectGeometry';

describe('simple object geometry', () => {
  it('normalizes a rectangle drawn from bottom-right to top-left', () => {
    expect(getRectangleGeometry([new Vec2(5, 4), new Vec2(1, 1)])).toEqual({
      x: 1,
      y: 1,
      width: 4,
      height: 3,
    });
  });

  it('places an ellipse center at the middle of its bounding box', () => {
    expect(getEllipseGeometry([new Vec2(0, 0), new Vec2(4, 2)])).toEqual({
      cx: 2,
      cy: 1,
      rx: 2,
      ry: 1,
    });
  });

  it('keeps line endpoints in order', () => {
    expect(getLineGeometry([new Vec2(1, 2), new Vec2(3, 4)])).toEqual({
      x1: 1,
      y1: 2,
      x2: 3,
      y2: 4,
    });
  });
});
