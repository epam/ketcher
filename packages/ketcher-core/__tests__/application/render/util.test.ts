import { Box2Abs, HalfBond, Vec2 } from 'domain/entities';
import util from './../../../src/application/render/util';

describe('util', () => {
  describe('chooseNonOverlappingLabelPlacement()', () => {
    it('moves labels out of occupied boxes when all sectors initially collide', () => {
      const directions = [new Vec2(1, 0), new Vec2(0, 1)];
      const getLabelBox = (direction: Vec2, additionalDistance: number) => {
        const shift = direction.scaled(additionalDistance);
        return new Box2Abs(
          direction.x * 10 + shift.x,
          direction.y * 10 + shift.y,
          direction.x * 10 + shift.x + 4,
          direction.y * 10 + shift.y + 4,
        );
      };

      const placement = util.chooseNonOverlappingLabelPlacement(
        directions,
        getLabelBox,
        (_direction, additionalDistance) => additionalDistance,
        [new Box2Abs(10, 0, 14, 4), new Box2Abs(0, 10, 4, 14)],
      );

      expect(placement).toEqual({
        direction: directions[0],
        additionalDistance: 4.5,
      });
      const placedLabel = getLabelBox(
        placement.direction,
        placement.additionalDistance,
      );
      expect(
        placedLabel.p0.x < 14 &&
          placedLabel.p1.x > 10 &&
          placedLabel.p0.y < 4 &&
          placedLabel.p1.y > 0,
      ).toBe(false);
    });

    it('prefers the closest total placement over the smallest extra shift', () => {
      const directions = [new Vec2(1, 0), new Vec2(0, 1)];
      const getLabelBox = (direction: Vec2) =>
        new Box2Abs(
          direction.x * 10,
          direction.y * 10,
          direction.x * 10 + 4,
          direction.y * 10 + 4,
        );

      const placement = util.chooseNonOverlappingLabelPlacement(
        directions,
        getLabelBox,
        (direction, additionalDistance) =>
          (direction === directions[0] ? 100 : 20) + additionalDistance,
        [],
      );

      expect(placement).toEqual({
        direction: directions[1],
        additionalDistance: 0,
      });
    });
  });

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
});
