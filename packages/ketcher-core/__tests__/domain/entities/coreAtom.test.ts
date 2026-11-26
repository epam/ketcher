import { Atom, type AtomProperties } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';
import { AtomList } from 'domain/entities/atomList';
import { Vec2 } from 'domain/entities/vec2';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { CoreAtomLabel } from 'domain/constants';

const monomer = {} as BaseMonomer;

// Builds C–<atom>–C and returns the middle atom, which has two single bonds.
function createMiddleAtom(label: string, properties: AtomProperties = {}) {
  const atom = new Atom(
    new Vec2(1, 0),
    monomer,
    1,
    label as CoreAtomLabel,
    properties,
  );
  const left = new Atom(new Vec2(0, 0), monomer, 0, 'C' as CoreAtomLabel);
  const right = new Atom(new Vec2(2, 0), monomer, 2, 'C' as CoreAtomLabel);
  atom.addBond(new Bond(left, atom, 0));
  atom.addBond(new Bond(atom, right, 1));
  return atom;
}

// Elements: C=6, N=7
const createAtomList = () => new AtomList({ notList: false, ids: [6, 7] });

describe('Atom valence of query atoms', () => {
  it('reports no bad valence for an atom list with an explicit valence lower than its bonds', () => {
    const atom = createMiddleAtom('L#', {
      atomList: createAtomList(),
      explicitValence: 1,
    });

    expect(atom.hasBadValence).toBe(false);
    expect(atom.calculateValence().hydrogenAmount).toBe(0);
  });

  it('adds no implicit hydrogens to an atom list with an explicit valence higher than its bonds', () => {
    const atom = createMiddleAtom('L#', {
      atomList: createAtomList(),
      explicitValence: 3,
    });

    expect(atom.calculateValence()).toEqual({ valence: 3, hydrogenAmount: 0 });
  });

  it.each(['A', 'Q', 'X', 'M'])(
    'reports no bad valence for the generic atom %s with an explicit valence lower than its bonds',
    (label) => {
      const atom = createMiddleAtom(label, { explicitValence: 1 });

      expect(atom.hasBadValence).toBe(false);
      expect(atom.calculateValence().hydrogenAmount).toBe(0);
    },
  );

  it('still reports bad valence for a regular element with an explicit valence lower than its bonds', () => {
    const atom = createMiddleAtom('C', { explicitValence: 1 });

    expect(atom.hasBadValence).toBe(true);
  });
});
