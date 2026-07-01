import { HalfBond } from 'domain/entities';
import { Vec2 } from 'domain/entities/vec2';
import util from './../../../src/application/render/util';

describe('util', () => {
  describe('updateHalfBondCoordinates()', () => {
    let hb1: HalfBond;
    let hb2: HalfBond;
    const xShift = 1;
    beforeEach(() => {
      hb1 = new HalfBond(1, 2, 1);
      hb2 = new HalfBond(1, 2, 1);
      hb1.p.x = 100;
      hb1.p.y = 100;
      hb2.p.x = 110;
      hb2.p.y = 100;
    });

    it('should not update the coordinates if y-coordinates are different', () => {
      hb2.p.y = hb2.p.y + 1;

      const result = util.updateHalfBondCoordinates(hb1, hb2, xShift);
      expect(result).toEqual([hb1, hb2]);
    });
    it('should update the coordinates if x-coordinate of hb1 is less than hb2', () => {
      const result = util.updateHalfBondCoordinates(hb1, hb2, xShift);

      expect(result[0].p.x).toBe(101);
    });
    it('should update the coordinates if x-coordinate of hb2 is less than hb1', () => {
      hb2.p.x = 90;
      const result = util.updateHalfBondCoordinates(hb1, hb2, xShift);
      expect(result[0].p.x).toBe(99);
    });
  });

  describe('findMiddlePoint()', () => {
    const a = new Vec2(0, 0);
    const b = new Vec2(10, 0);

    it('returns chord midpoint when height is 0', () => {
      const mid = util.findMiddlePoint(0, a, b);
      expect(mid.x).toBeCloseTo(5);
      expect(mid.y).toBeCloseTo(0);
    });

    it('returns apex offset from chord for non-zero height', () => {
      const apex = util.findMiddlePoint(3, a, b);
      const chordMid = Vec2.centre(a, b);
      expect(apex.x).toBeCloseTo(5);
      expect(Vec2.dist(apex, chordMid)).toBeCloseTo(3);
    });
  });

  describe('calculateDistanceToEllipticalArc()', () => {
    const a = new Vec2(0, 0);
    const b = new Vec2(10, 0);
    const height = 4;

    it('returns ~0 at endpoints and apex', () => {
      const apex = util.findMiddlePoint(height, a, b);
      expect(
        util.calculateDistanceToEllipticalArc(a, a, b, height),
      ).toBeCloseTo(0);
      expect(
        util.calculateDistanceToEllipticalArc(b, a, b, height),
      ).toBeCloseTo(0);
      expect(
        util.calculateDistanceToEllipticalArc(apex, a, b, height),
      ).toBeLessThan(0.5);
    });

    it('returns ~|height| at chord midpoint (not on arc)', () => {
      const chordMid = Vec2.centre(a, b);
      const dist = util.calculateDistanceToEllipticalArc(
        chordMid,
        a,
        b,
        height,
      );
      expect(dist).toBeCloseTo(Math.abs(height), 0.5);
    });

    it('degenerates to line distance when height is 0', () => {
      const point = new Vec2(5, 3);
      expect(util.calculateDistanceToEllipticalArc(point, a, b, 0)).toBeCloseTo(
        point.calculateDistanceToLine([a, b]),
      );
    });

    it('handles negative height', () => {
      const apex = util.findMiddlePoint(-height, a, b);
      expect(
        util.calculateDistanceToEllipticalArc(apex, a, b, -height),
      ).toBeLessThan(0.5);
    });
  });
});
