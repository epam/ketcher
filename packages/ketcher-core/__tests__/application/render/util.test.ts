import { HalfBond } from 'domain/entities';
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
});
