import { Atom as MicroAtom } from 'domain/entities/atom';
import { Bond as MicroBond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import type { Atom } from 'domain/entities/CoreAtom';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { type Bond, BondType } from 'domain/entities/CoreBond';

export type CoreAtomDativeValence = {
  valence: number;
  implicitH: number;
  hasBadConnection: boolean;
};

const isDativeBond = (bond: Bond | MonomerToAtomBond) =>
  !(bond instanceof MonomerToAtomBond) && bond.type === BondType.Dative;

export function hasDativeBond(atom: Atom): boolean {
  return atom.bonds.some(isDativeBond);
}

function createMicroAtom(atom: Atom) {
  const { properties } = atom;
  const structAtom = atom.monomer.monomerItem.struct.atoms.get(
    atom.atomIdInMicroMode,
  );
  const microAtom = structAtom
    ? structAtom.clone()
    : new MicroAtom({ label: atom.label });

  microAtom.label = atom.label;
  microAtom.charge = properties.charge ?? null;
  microAtom.explicitValence = properties.explicitValence ?? -1;
  microAtom.isotope = properties.isotope ?? null;
  microAtom.radical = properties.radical ?? 0;
  microAtom.atomList = properties.atomList ?? null;
  microAtom.fragment = 0;

  return microAtom;
}

/**
 * Macromolecules mode keeps its own atoms, so the dative valence rules of Struct
 * are applied to a temporary copy of the connected micromolecule.
 * Returns null when the atom has no dative bonds and the usual valence applies.
 */
export function calcCoreAtomDativeValence(
  atom: Atom,
): CoreAtomDativeValence | null {
  if (!hasDativeBond(atom)) {
    return null;
  }

  const struct = new Struct();
  const atomIds = new Map<Atom, number>();
  const visitedBonds = new Set<Bond>();
  const queue: Atom[] = [atom];

  const addAtom = (coreAtom: Atom) => {
    const aid = struct.atoms.add(createMicroAtom(coreAtom));
    atomIds.set(coreAtom, aid);
    queue.push(coreAtom);
    return aid;
  };

  atomIds.set(atom, struct.atoms.add(createMicroAtom(atom)));

  for (let i = 0; i < queue.length; i++) {
    const currentAtom = queue[i];
    const currentId = atomIds.get(currentAtom) as number;

    for (const bond of currentAtom.bonds) {
      if (bond instanceof MonomerToAtomBond) {
        // a monomer is a single covalent connection that is not part of the molecule
        const monomerId = struct.atoms.add(new MicroAtom({ label: 'C' }));
        struct.bonds.add(
          new MicroBond({
            begin: currentId,
            end: monomerId,
            type: MicroBond.PATTERN.TYPE.SINGLE,
          }),
        );
        continue;
      }
      if (visitedBonds.has(bond)) {
        continue;
      }
      visitedBonds.add(bond);

      const otherAtom =
        bond.firstAtom === currentAtom ? bond.secondAtom : bond.firstAtom;
      if (!atomIds.has(otherAtom)) {
        addAtom(otherAtom);
      }
      struct.bonds.add(
        new MicroBond({
          begin: atomIds.get(bond.firstAtom) as number,
          end: atomIds.get(bond.secondAtom) as number,
          type: bond.type,
          stereo: bond.stereo,
        }),
      );
    }
  }

  struct.initHalfBonds();
  struct.initNeighbors();

  const aid = atomIds.get(atom) as number;
  struct.calcImplicitHydrogen(aid);
  const calculatedAtom = struct.atoms.get(aid) as MicroAtom;

  return {
    valence: calculatedAtom.valence,
    implicitH: calculatedAtom.implicitH,
    hasBadConnection: calculatedAtom.badConn,
  };
}
