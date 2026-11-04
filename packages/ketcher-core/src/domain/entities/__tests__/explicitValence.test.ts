import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';

function oxygenWithBonds(
  properties: { explicitValence: number; charge: number; radical?: number },
  bondTypes: number[] = [1, 1],
) {
  const struct = new Struct();
  const oxygen = new Atom({ label: 'O', ...properties });
  const oxygenId = struct.atoms.add(oxygen);
  for (const type of bondTypes) {
    const carbonId = struct.atoms.add(new Atom({ label: 'C' }));
    struct.bonds.add(new Bond({ begin: oxygenId, end: carbonId, type }));
  }
  struct.initHalfBonds();
  struct.initNeighbors();
  struct.calcImplicitHydrogen(oxygenId);
  return { struct, oxygen, oxygenId };
}

describe('explicit valence validation (#5852)', () => {
  it('accepts oxygen with two single bonds, valence II and charge -1', () => {
    const { oxygen } = oxygenWithBonds({ explicitValence: 2, charge: -1 });
    expect(oxygen.badConn).toBe(false);
    expect(oxygen.implicitH).toBe(0);
    expect(oxygen.charge).toBe(-1);
  });

  describe.each([-1, 0, 1])('charge %i', (charge) => {
    it.each([0, 1, 2, 3])(
      'ignores radical %i for explicit valence',
      (radical) => {
        const { oxygen } = oxygenWithBonds({
          explicitValence: 2,
          charge,
          radical,
        });
        expect(oxygen.badConn).toBe(false);
        expect(oxygen.implicitH).toBe(0);
        expect(oxygen.charge).toBe(charge);
        expect(oxygen.radical).toBe(radical);
      },
    );
  });

  it.each([0, 1])(
    'warns when two bonds exceed explicit valence %i',
    (valence) => {
      const { oxygen } = oxygenWithBonds({
        explicitValence: valence,
        charge: 0,
      });
      expect(oxygen.badConn).toBe(true);
      expect(oxygen.implicitH).toBe(0);
    },
  );

  it('fills explicit valence with hydrogen regardless of charge or radical', () => {
    const { oxygen } = oxygenWithBonds(
      { explicitValence: 2, charge: -1, radical: 2 },
      [Bond.PATTERN.TYPE.SINGLE],
    );
    expect(oxygen.badConn).toBe(false);
    expect(oxygen.implicitH).toBe(1);
  });

  it('counts bond orders rather than neighbors', () => {
    const { oxygen } = oxygenWithBonds({ explicitValence: 2, charge: -1 }, [2]);
    expect(oxygen.badConn).toBe(false);
    expect(oxygen.implicitH).toBe(0);
  });

  it('restores charge validation when explicit valence is cleared', () => {
    const { oxygen, struct, oxygenId } = oxygenWithBonds({
      explicitValence: 2,
      charge: -1,
    });
    oxygen.explicitValence = -1;
    struct.calcImplicitHydrogen(oxygenId);
    expect(oxygen.badConn).toBe(true);
    oxygen.explicitValence = 2;
    struct.calcImplicitHydrogen(oxygenId);
    expect(oxygen.badConn).toBe(false);
  });

  it('still accounts for radicals without explicit valence', () => {
    const { oxygen } = oxygenWithBonds({
      explicitValence: -1,
      charge: 0,
      radical: 2,
    });
    expect(oxygen.badConn).toBe(true);
  });
});
