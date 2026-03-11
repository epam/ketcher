import { Box2Abs, HalfBond, Vec2 } from 'domain/entities';
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

  describe('getLabelCenterDistance()', () => {
    const anchorPoint = new Vec2(0, 0);
    const direction = new Vec2(1, 0);
    const baseDistance = 3;

    it('should place a standalone label outside of the atom area', () => {
      const result = util.getLabelCenterDistance({
        anchorPoint,
        direction,
        width: 10,
        height: 8,
        baseDistance,
      });

      expect(result).toBe(11);
    });

    it('should move the label farther to avoid an existing obstacle label', () => {
      const result = util.getLabelCenterDistance({
        anchorPoint,
        direction,
        width: 8,
        height: 8,
        baseDistance,
        obstacles: [
          {
            centerDistance: 12,
            width: 20,
            height: 10,
          },
        ],
      });

      expect(result).toBe(29);
    });

    it('should account for occupied boxes and all previous label obstacles', () => {
      const result = util.getLabelCenterDistance({
        anchorPoint,
        direction,
        width: 8,
        height: 8,
        baseDistance,
        occupiedBoxes: [
          Box2Abs.fromRelBox({
            x: -6,
            y: -6,
            width: 12,
            height: 12,
          }),
        ],
        obstacles: [
          {
            centerDistance: 12,
            width: 20,
            height: 10,
          },
          {
            centerDistance: 30,
            width: 6,
            height: 6,
          },
        ],
      });

      expect(result).toBe(40);
    });
  });
});
