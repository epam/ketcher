import { Vec2 } from 'domain/entities/vec2';
import { Box2Abs } from 'domain/entities/box2Abs';
import {
  findLargestSector,
  attachmentPointDirection,
  attachmentPointGeometry,
  atomLabelShift,
  limitBondLabelShift,
} from '../atomGeometry';

describe('shared atom geometry', () => {
  it('finds the wrapping sector without changing neighbor order', () => {
    const angles = [Math.PI / 4, -Math.PI / 4];
    expect(findLargestSector(angles)).toEqual({
      neighborAngle: Math.PI / 4,
      largestAngle: (3 * Math.PI) / 2,
    });
    expect(angles).toEqual([Math.PI / 4, -Math.PI / 4]);
  });

  it('preserves the empty and equal-sector conventions', () => {
    expect(findLargestSector([])).toEqual({
      neighborAngle: -Math.PI / 2,
      largestAngle: 0,
    });
    expect(findLargestSector([0, Math.PI])).toEqual({
      neighborAngle: 0,
      largestAngle: Math.PI,
    });
  });

  it('preserves the micro renderer arithmetic for wrapping sectors', () => {
    const angles = [-7 / 97, 7 / 173];
    expect(findLargestSector(angles)).toEqual({
      neighborAngle: angles[1],
      largestAngle: angles[0] - angles[1] + 2 * Math.PI,
    });
    const angle = angles[1] + ((angles[0] - angles[1] + 2 * Math.PI) * 2) / 3;
    const direction = attachmentPointDirection(
      angles.map((angle) => ({ angle, isTriple: false })),
      'secondary',
      true,
    );
    expect(direction).toEqual(new Vec2(Math.cos(angle), Math.sin(angle)));
  });

  it('places single-bond and triple-bond APs at 120 and 180 degrees', () => {
    const single = attachmentPointDirection(
      [{ angle: 0, isTriple: false }],
      'primary',
      false,
    );
    expect(single.x).toBeCloseTo(-0.5);
    expect(single.y).toBeCloseTo(Math.sqrt(3) / 2);
    const triple = attachmentPointDirection(
      [{ angle: 0, isTriple: true }],
      'primary',
      false,
    );
    expect(triple.x).toBeCloseTo(-1);
    expect(triple.y).toBeCloseTo(0);
  });

  it('trisects the largest sector for primary and secondary APs', () => {
    const neighbors = [{ angle: 0, isTriple: false }];
    const primary = attachmentPointDirection(neighbors, 'primary', true);
    const secondary = attachmentPointDirection(neighbors, 'secondary', true);
    expect(primary.x).toBeCloseTo(-0.5);
    expect(secondary.x).toBeCloseTo(-0.5);
    expect(primary.y).toBeCloseTo(-secondary.y);
  });

  it('keeps the endpoint and number fixed when a wide label shortens the stem', () => {
    const position = new Vec2(10, 20);
    const direction = new Vec2(0, 1);
    const normal = attachmentPointGeometry(position, direction, 40, position);
    const wide = attachmentPointGeometry(
      position,
      direction,
      40,
      new Vec2(10, 120),
    );
    expect(wide.attachmentPointEnd).toEqual(normal.attachmentPointEnd);
    expect(wide.labelPosition).toEqual(normal.labelPosition);
    expect(wide.shiftedStemStart).toEqual(new Vec2(10, 48));
    expect(wide.attachmentPointEnd).toEqual(new Vec2(10, 54));
  });

  it('accounts for label boxes, charge scaling and short bonds', () => {
    const box = new Box2Abs(-5, -5, 5, 5);
    expect(atomLabelShift(new Vec2(100, 200), new Vec2(1, 0), [box])).toBe(5);
    expect(atomLabelShift(new Vec2(100, 200), new Vec2(1, 0), [box], 0.5)).toBe(
      2.5,
    );
    expect(limitBondLabelShift(100, 40, 6)).toBe(14);
    expect(limitBondLabelShift(100, 8, 6)).toBe(0);
  });
});
