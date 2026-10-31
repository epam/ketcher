import { assert } from 'utilities';
import { type Atom, radicalElectrons } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import type { Struct } from 'domain/entities/struct';
import {
  findKekuleDoubleBondAtoms,
  type KekuleAtom,
} from 'domain/entities/aromaticKekulization';
import { isAllowedNonAttachmentGroupHapticBondMetal } from 'domain/helpers/hapticBond';

export type DativeBondCounts = {
  donorCount: number;
  acceptorCount: number;
};

type AromaticSystemKekulization = {
  atoms: Map<number, KekuleAtom> | null;
  doubleBondAtoms: Set<number> | null;
};

/** Kekulé structures of aromatic systems, shared by the atoms of one recalculation */
export type KekulizationCache = Map<number, AromaticSystemKekulization>;

function* getVisibleBonds(
  struct: Struct,
  atom: Atom,
  includeAtomsInCollapsedSgroups: boolean,
) {
  for (const neighborId of atom.neighbors) {
    const hb = struct.halfBonds.get(neighborId);
    assert(hb, `HalfBond ${neighborId} not found`);
    const bond = struct.bonds.get(hb.bid);
    assert(bond, `Bond ${hb.bid} not found`);

    if (
      Bond.isBondToHiddenLeavingGroup(
        struct,
        bond,
        includeAtomsInCollapsedSgroups,
      )
    ) {
      continue;
    }
    yield { bond, otherAtomId: hb.end };
  }
}

/** Covalent order of a bond that is not aromatic, or null for aromatic and query bonds */
function getNonAromaticBondOrder(bond: Bond, atom: Atom): number | null {
  switch (bond.type) {
    case Bond.PATTERN.TYPE.SINGLE:
    case Bond.PATTERN.TYPE.DOUBLE:
    case Bond.PATTERN.TYPE.TRIPLE:
      return bond.type;
    case Bond.PATTERN.TYPE.HAPTIC:
      return isAllowedNonAttachmentGroupHapticBondMetal(atom) ? 0 : 1;
    case Bond.PATTERN.TYPE.DATIVE:
    case Bond.PATTERN.TYPE.HYDROGEN:
      return 0;
    default:
      return null;
  }
}

export function countDativeBonds(
  struct: Struct,
  atomId: number,
  atom: Atom,
  includeAtomsInCollapsedSgroups: boolean,
): DativeBondCounts {
  let donorCount = 0;
  let acceptorCount = 0;
  for (const { bond } of getVisibleBonds(
    struct,
    atom,
    includeAtomsInCollapsedSgroups,
  )) {
    if (bond.type !== Bond.PATTERN.TYPE.DATIVE) {
      continue;
    }
    if (bond.begin === atomId) {
      donorCount++;
    } else {
      acceptorCount++;
    }
  }
  return { donorCount, acceptorCount };
}

/** Lower bound of the covalent bond order sum, used when exact orders are unknown */
export function calcCovalentBondOrderLowerBound(
  struct: Struct,
  atom: Atom,
  includeAtomsInCollapsedSgroups: boolean,
): number {
  let bondOrderSum = 0;
  for (const { bond } of getVisibleBonds(
    struct,
    atom,
    includeAtomsInCollapsedSgroups,
  )) {
    // Aromatic and query bonds contribute at least one
    bondOrderSum += getNonAromaticBondOrder(bond, atom) ?? 1;
  }
  return bondOrderSum;
}

/** Covalent bond order sum of an aromatic atom in the Kekulé structure, or null */
export function calcKekuleBondOrderSum(
  struct: Struct,
  atomId: number,
  includeAtomsInCollapsedSgroups: boolean,
  kekulizationCache: KekulizationCache,
): number | null {
  let kekulization = kekulizationCache.get(atomId);
  if (!kekulization) {
    const systemAtomIds = collectAromaticSystemAtomIds(
      struct,
      atomId,
      includeAtomsInCollapsedSgroups,
    );
    const atoms = buildKekuleAtoms(
      struct,
      systemAtomIds,
      includeAtomsInCollapsedSgroups,
    );
    const systemKekulization = {
      atoms,
      doubleBondAtoms: atoms ? findKekuleDoubleBondAtoms(atoms) : null,
    };
    systemAtomIds.forEach((systemAtomId) =>
      kekulizationCache.set(systemAtomId, systemKekulization),
    );
    kekulization = systemKekulization;
  }

  const kekuleAtom = kekulization.atoms?.get(atomId);
  if (!kekuleAtom || !kekulization.doubleBondAtoms) {
    return null;
  }
  return (
    kekuleAtom.externalBondOrderSum +
    kekuleAtom.aromaticNeighbors.length +
    (kekulization.doubleBondAtoms.has(atomId) ? 1 : 0)
  );
}

/** Atoms whose dative valence must be recalculated after the atoms in atomIds changed */
export function collectDativeAtomsToRecalculate(
  struct: Struct,
  atomIds: Array<number>,
  includeAtomsInCollapsedSgroups: boolean,
): Set<number> {
  const result = new Set(atomIds);
  const seedIds = new Set(atomIds);
  atomIds.forEach((atomId) => {
    const atom = struct.atoms.get(atomId);
    if (!atom) {
      return;
    }
    for (const { otherAtomId } of getVisibleBonds(
      struct,
      atom,
      includeAtomsInCollapsedSgroups,
    )) {
      seedIds.add(otherAtomId);
    }
  });

  const walkedAtomIds = new Set<number>();
  seedIds.forEach((seedId) => {
    if (walkedAtomIds.has(seedId)) {
      return;
    }
    const systemAtomIds = collectAromaticSystemAtomIds(
      struct,
      seedId,
      includeAtomsInCollapsedSgroups,
    );
    if (systemAtomIds.size < 2) {
      return;
    }
    systemAtomIds.forEach((systemAtomId) => {
      walkedAtomIds.add(systemAtomId);
      const atom = struct.atoms.get(systemAtomId);
      if (!atom) {
        return;
      }
      const { donorCount, acceptorCount } = countDativeBonds(
        struct,
        systemAtomId,
        atom,
        includeAtomsInCollapsedSgroups,
      );
      if (donorCount + acceptorCount > 0) {
        result.add(systemAtomId);
      }
    });
  });
  return result;
}

/** Atoms connected to atomId through aromatic bonds, atomId included */
function collectAromaticSystemAtomIds(
  struct: Struct,
  atomId: number,
  includeAtomsInCollapsedSgroups: boolean,
): Set<number> {
  const systemAtomIds = new Set([atomId]);
  const queue = [atomId];

  for (let i = 0; i < queue.length; i++) {
    const atom = struct.atoms.get(queue[i]);
    if (!atom) {
      continue;
    }
    for (const { bond, otherAtomId } of getVisibleBonds(
      struct,
      atom,
      includeAtomsInCollapsedSgroups,
    )) {
      if (
        bond.type === Bond.PATTERN.TYPE.AROMATIC &&
        !systemAtomIds.has(otherAtomId)
      ) {
        systemAtomIds.add(otherAtomId);
        queue.push(otherAtomId);
      }
    }
  }
  return systemAtomIds;
}

/** Kekulé inputs of every atom in an aromatic system, or null if one is not supported */
function buildKekuleAtoms(
  struct: Struct,
  systemAtomIds: Set<number>,
  includeAtomsInCollapsedSgroups: boolean,
): Map<number, KekuleAtom> | null {
  const kekuleAtoms = new Map<number, KekuleAtom>();
  for (const atomId of systemAtomIds) {
    const atom = struct.atoms.get(atomId);
    if (!atom || atom.isQuery() || atom.attachmentPoints) {
      return null;
    }

    let externalBondOrderSum = 0;
    let donorCount = 0;
    let acceptorCount = 0;
    const aromaticNeighbors: number[] = [];
    for (const { bond, otherAtomId } of getVisibleBonds(
      struct,
      atom,
      includeAtomsInCollapsedSgroups,
    )) {
      if (bond.type === Bond.PATTERN.TYPE.AROMATIC) {
        aromaticNeighbors.push(otherAtomId);
        continue;
      }
      const bondOrder = getNonAromaticBondOrder(bond, atom);
      if (bondOrder === null) {
        return null;
      }
      externalBondOrderSum += bondOrder;
      if (bond.type === Bond.PATTERN.TYPE.DATIVE) {
        if (bond.begin === atomId) {
          donorCount++;
        } else {
          acceptorCount++;
        }
      }
    }

    kekuleAtoms.set(atomId, {
      label: atom.label,
      charge: atom.charge ?? 0,
      radicalCount: radicalElectrons(atom.radical),
      externalBondOrderSum,
      fixedHydrogenCount: atom.implicitHCount ?? 0,
      aromaticNeighbors,
      preferDoubleBond: donorCount > acceptorCount,
    });
  }
  return kekuleAtoms;
}
