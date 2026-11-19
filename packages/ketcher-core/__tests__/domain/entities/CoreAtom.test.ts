import { AtomLabel } from 'domain/constants';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Atom } from 'domain/entities/CoreAtom';
import { Vec2 } from 'domain/entities/vec2';

describe('Atom implicit hydrogens', () => {
  const monomer = {} as BaseMonomer;

  it('has no implicit hydrogens if it has query properties', () => {
    const atom = new Atom(new Vec2(0, 0), monomer, 0, AtomLabel.N);
    const queryAtom = new Atom(new Vec2(0, 0), monomer, 1, AtomLabel.N, {
      substitutionCount: 1,
    });

    expect(atom.calculateValence().hydrogenAmount).toBe(3);
    expect(queryAtom.calculateValence().hydrogenAmount).toBe(0);
  });

  it('uses implicit H count if it is the only query property', () => {
    const atom = new Atom(new Vec2(0, 0), monomer, 0, AtomLabel.N, {
      implicitHCount: 2,
    });

    expect(atom.calculateValence().hydrogenAmount).toBe(2);
  });
});
