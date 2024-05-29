import { Bond, BondAttributes } from 'domain/entities/bond';

import { Vec2 } from 'domain/entities/vec2';

const bondParams: BondAttributes = {
  begin: 1,
  end: 2,
  type: 1,
  stereo: 0,
  topology: 1,
};

describe('Bond', () => {
  describe('getAttrHash static function', () => {
    it('should return attributes', () => {
      const bond = new Bond(bondParams);
      const attrs = {
        stereo: 0,
        topology: 1,
        type: 1,
      };

      expect(Bond.getAttrHash(bond)).toStrictEqual(attrs);
    });
  });

  describe('attrGetDefault static function', () => {
    it('should return attribute value', () => {
      expect(Bond.attrGetDefault('stereo')).toBe(0);
      expect(Bond.attrGetDefault('topology')).toBe(0);
      expect(Bond.attrGetDefault('type')).toBe(1);
      expect(Bond.attrGetDefault('reactingCenterStatus')).toBe(0);
    });
  });

  describe('hasRxnProps', () => {
    it('should return true if bond has reactingCenterStatus > 0', () => {
      const paramsWithReactingCenterStatus = {
        ...bondParams,
        reactingCenterStatus: 1,
      };
      const bond = new Bond(paramsWithReactingCenterStatus);

      expect(bond.hasRxnProps()).toBe(true);
    });

    it('should return false if bond has not reactingCenterStatus', () => {
      const paramsWithReactingCenterStatus = {
        ...bondParams,
        reactingCenterStatus: 0,
      };
      const bond = new Bond(paramsWithReactingCenterStatus);

      expect(bond.hasRxnProps()).toBe(false);
    });
  });

  describe('getCenter', () => {
    it('should return center of bond', () => {
      const bond = new Bond(bondParams);
      const struct = { atoms: new Map() };
      struct.atoms.set(bond.begin, { pp: new Vec2(2, 4, 6) });
      struct.atoms.set(bond.end, { pp: new Vec2(4, 0, 2) });
      const bondCenter = new Vec2(3, 2, 4);

      expect(bond.getCenter(struct)).toStrictEqual(bondCenter);
    });
  });

  describe('getDir', () => {
    it('should return direction', () => {
      const bond = new Bond(bondParams);
      const struct = { atoms: new Map() };
      struct.atoms.set(bond.begin, { pp: new Vec2(2, 4, 6) });
      struct.atoms.set(bond.end, { pp: new Vec2(4, 0, 2) });
      const bondDir = new Vec2(
        0.4472135954999579,
        -0.8944271909999159,
        -0.8944271909999159,
      );

      expect(bond.getDir(struct)).toStrictEqual(bondDir);
    });
  });

  describe('clone', () => {
    it('should return copy of bond if do not pass the arguments', () => {
      const bond = new Bond(bondParams);

      expect(bond.clone()).toStrictEqual(bond);
    });

    it('should return copy of bond with new begin and end coordinates', () => {
      const bond = new Bond(bondParams);
      const aidMap = new Map();
      const newBegin = 2;
      const newEnd = 3;
      aidMap.set(1, newBegin);
      aidMap.set(2, newEnd);
      const bondCopy = new Bond({
        ...bondParams,
        begin: newBegin,
        end: newEnd,
      });

      expect(bond.clone(aidMap)).toStrictEqual(bondCopy);
    });
  });
});
