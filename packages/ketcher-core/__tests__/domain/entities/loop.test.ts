import { Bond } from 'domain/entities/bond';
import { HalfBond } from 'domain/entities/halfBond';
import { Loop } from 'domain/entities/loop';
import { Struct } from 'domain/entities/struct';

describe('Loop', () => {
  it('should preserve loop properties for existing half-bonds and bonds', () => {
    const struct = new Struct();
    const aromaticBondId = struct.bonds.add(
      new Bond({ begin: 1, end: 2, type: Bond.PATTERN.TYPE.AROMATIC }),
    );
    const doubleBondId = struct.bonds.add(
      new Bond({ begin: 2, end: 3, type: Bond.PATTERN.TYPE.DOUBLE }),
    );
    const aromaticHalfBondId = struct.halfBonds.add(
      new HalfBond(1, 2, aromaticBondId),
    );
    const doubleHalfBondId = struct.halfBonds.add(
      new HalfBond(2, 3, doubleBondId),
    );

    const loop = new Loop([aromaticHalfBondId, doubleHalfBondId], struct, true);

    expect(loop.hbs).toStrictEqual([aromaticHalfBondId, doubleHalfBondId]);
    expect(loop.aromatic).toBe(false);
    expect(loop.dblBonds).toBe(1);
    expect(loop.convex).toBe(true);
  });

  it('should throw when a referenced half-bond is missing', () => {
    const struct = new Struct();

    expect(() => new Loop([0], struct, false)).toThrow(
      'Expected half-bond 0 to exist when constructing loop',
    );
  });

  it('should throw when a referenced bond is missing', () => {
    const struct = new Struct();
    const halfBondId = struct.halfBonds.add(new HalfBond(1, 2, 100));

    expect(() => new Loop([halfBondId], struct, false)).toThrow(
      `Expected bond 100 to exist for half-bond ${halfBondId} when constructing loop`,
    );
  });
});
