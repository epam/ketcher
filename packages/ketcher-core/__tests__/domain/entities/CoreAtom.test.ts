import { Atom, AtomRadical } from 'domain/entities/CoreAtom';
import { Bond, BondType } from 'domain/entities/CoreBond';
import { Peptide } from 'domain/entities/Peptide';
import { Vec2 } from 'domain/entities/vec2';
import { AtomLabel } from 'domain/constants';
import { peptideMonomerItem } from '../../mock-data';

function oxygenWithTwoBonds(
  explicitValence: number,
  charge: number,
  radical: AtomRadical,
) {
  const monomer = new Peptide(peptideMonomerItem);
  const oxygen = new Atom(new Vec2(), monomer, 0, AtomLabel.O, {
    explicitValence,
    charge,
    radical,
  });
  for (let i = 1; i <= 2; i++) {
    const carbon = new Atom(new Vec2(i, 0), monomer, i, AtomLabel.C);
    oxygen.addBond(new Bond(oxygen, carbon, i, BondType.Single));
  }
  return oxygen;
}

describe('CoreAtom explicit valence (#5852)', () => {
  describe.each([-1, 0, 1])('charge %i', (charge) => {
    it.each([
      AtomRadical.None,
      AtomRadical.Single,
      AtomRadical.Doublet,
      AtomRadical.Triplet,
    ])('ignores radical %i when explicit valence is set', (radical) => {
      const oxygen = oxygenWithTwoBonds(2, charge, radical);
      expect(oxygen.calculateValence()).toEqual({
        valence: 2,
        hydrogenAmount: 0,
      });
      expect(oxygen.hasBadValence).toBe(false);
      expect(oxygen.properties).toEqual({
        explicitValence: 2,
        charge,
        radical,
      });
    });
  });

  it.each([0, 1])('warns for overconnected explicit valence %i', (valence) => {
    const oxygen = oxygenWithTwoBonds(valence, 0, AtomRadical.None);
    expect(oxygen.hasBadValence).toBe(true);
  });

  it('retains default charge validation when explicit valence is cleared', () => {
    const oxygen = oxygenWithTwoBonds(2, -1, AtomRadical.None);
    oxygen.properties.explicitValence = -1;
    expect(oxygen.hasBadValence).toBe(true);
    oxygen.properties.explicitValence = 2;
    expect(oxygen.hasBadValence).toBe(false);
  });
});
