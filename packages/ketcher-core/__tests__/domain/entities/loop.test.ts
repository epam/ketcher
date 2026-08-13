import { Bond } from 'domain/entities/bond';
import { HalfBond } from 'domain/entities/halfBond';
import { Loop } from 'domain/entities/loop';
import { Struct } from 'domain/entities/struct';

describe('Loop', () => {
  it('counts double bonds and detects non-aromatic loops', () => {
    const struct = new Struct();

    struct.bonds.set(
      1,
      new Bond({ begin: 1, end: 2, type: Bond.PATTERN.TYPE.AROMATIC }),
    );
    struct.bonds.set(
      2,
      new Bond({ begin: 2, end: 3, type: Bond.PATTERN.TYPE.DOUBLE }),
    );

    struct.halfBonds.set(10, new HalfBond(1, 2, 1));
    struct.halfBonds.set(11, new HalfBond(2, 3, 2));

    const loop = new Loop([10, 11], struct, false);

    expect(loop.aromatic).toBe(false);
    expect(loop.dblBonds).toBe(1);
    expect(loop.convex).toBe(false);
  });

  it('throws when a loop half-bond is missing', () => {
    const struct = new Struct();

    expect(() => new Loop([10], struct, false)).toThrow(
      'Loop half-bond 10 was not found',
    );
  });

  it('throws when a loop bond is missing', () => {
    const struct = new Struct();
    struct.halfBonds.set(10, new HalfBond(1, 2, 99));

    expect(() => new Loop([10], struct, false)).toThrow(
      'Loop bond 99 was not found',
    );
  });
});
