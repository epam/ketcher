import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Atom as CoreAtom } from 'domain/entities/CoreAtom';
import { Bond as CoreBond, BondType } from 'domain/entities/CoreBond';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { AtomLabel, type CoreAtomLabel } from 'domain/constants';

function createAtom(label: CoreAtomLabel, id: number) {
  const monomer = { monomerItem: { struct: new Struct() } } as BaseMonomer;
  return new CoreAtom(new Vec2(id, 0), monomer, id, label);
}

function connect(first: CoreAtom, second: CoreAtom, type: BondType) {
  const bond = new CoreBond(first, second, 0, type);
  first.addBond(bond);
  second.addBond(bond);
}

describe('CoreAtom valence with dative bonds', () => {
  it('keeps the usual hydrogen count without dative bonds', () => {
    const carbon = createAtom(AtomLabel.C, 0);
    const nickel = createAtom(AtomLabel.Ni, 1);
    connect(carbon, nickel, BondType.Single);

    expect(carbon.calculateValence().hydrogenAmount).toBe(3);
    expect(carbon.hasBadValence).toBe(false);
  });

  it('lowers the hydrogen count of dative carbon atoms', () => {
    const donor = createAtom(AtomLabel.C, 0);
    const acceptor = createAtom(AtomLabel.C, 1);
    connect(donor, acceptor, BondType.Dative);

    expect(donor.calculateValence().hydrogenAmount).toBe(2);
    expect(acceptor.calculateValence().hydrogenAmount).toBe(2);
  });

  it('counts hydrogens of a dative donor and acceptor separately', () => {
    const donor = createAtom(AtomLabel.In, 0);
    const acceptor = createAtom(AtomLabel.In, 1);
    connect(donor, acceptor, BondType.Dative);

    expect(donor.calculateValence().hydrogenAmount).toBe(1);
    expect(acceptor.calculateValence().hydrogenAmount).toBe(3);
  });

  it('flags a dative atom that exceeds its donor and acceptor limits', () => {
    const fluorine = createAtom(AtomLabel.F, 0);
    const carbon = createAtom(AtomLabel.C, 1);
    const oxygen = createAtom(AtomLabel.O, 2);
    connect(carbon, fluorine, BondType.Dative);
    connect(oxygen, fluorine, BondType.Dative);

    expect(fluorine.hasBadValence).toBe(true);
  });
});
