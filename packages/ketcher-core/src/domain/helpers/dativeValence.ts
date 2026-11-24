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

/** Covalent bond order sum of an aromatic atom in the Kekulé structure, or null */
export function calcKekuleBondOrderSum(
  struct: Struct,
  aid: number,
  includeAtomsInCollapsedSgroups: boolean,
  kekulizationCache: KekulizationCache,
): number | null {
  let kekulization = kekulizationCache.get(aid);
  if (!kekulization) {
    const atoms = collectAromaticSystem(
      struct,
      aid,
      includeAtomsInCollapsedSgroups,
    );
    const systemKekulization = {
      atoms,
      doubleBondAtoms: atoms ? findKekuleDoubleBondAtoms(atoms) : null,
    };
    (atoms ? [...atoms.keys()] : [aid]).forEach((atomId) =>
      kekulizationCache.set(atomId, systemKekulization),
    );
    kekulization = systemKekulization;
  }

  const kekuleAtom = kekulization.atoms?.get(aid);
  if (!kekuleAtom || !kekulization.doubleBondAtoms) {
    return null;
  }
  return (
    kekuleAtom.externalBondOrderSum +
    kekuleAtom.aromaticNeighbors.length +
    (kekulization.doubleBondAtoms.has(aid) ? 1 : 0)
  );
}

/** Atoms connected to aid through aromatic bonds, or null if one is not supported */
function collectAromaticSystem(
  struct: Struct,
  aid: number,
  includeAtomsInCollapsedSgroups: boolean,
): Map<number, KekuleAtom> | null {
  const system = new Map<number, KekuleAtom>();
  const queue = [aid];
  const visited = new Set([aid]);

  for (let i = 0; i < queue.length; i++) {
    const atomId = queue[i];
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
      switch (bond.type) {
        case Bond.PATTERN.TYPE.AROMATIC:
          aromaticNeighbors.push(otherAtomId);
          if (!visited.has(otherAtomId)) {
            visited.add(otherAtomId);
            queue.push(otherAtomId);
          }
          break;
        case Bond.PATTERN.TYPE.SINGLE:
        case Bond.PATTERN.TYPE.DOUBLE:
        case Bond.PATTERN.TYPE.TRIPLE:
          externalBondOrderSum += bond.type;
          break;
        case Bond.PATTERN.TYPE.DATIVE:
          if (bond.begin === atomId) {
            donorCount++;
          } else {
            acceptorCount++;
          }
          break;
        case Bond.PATTERN.TYPE.HYDROGEN:
          break;
        case Bond.PATTERN.TYPE.HAPTIC:
          if (!isAllowedNonAttachmentGroupHapticBondMetal(atom)) {
            externalBondOrderSum += 1;
          }
          break;
        default:
          return null;
      }
    }

    system.set(atomId, {
      label: atom.label,
      charge: atom.charge ?? 0,
      radicalCount: radicalElectrons(atom.radical),
      externalBondOrderSum,
      fixedHydrogenCount: atom.implicitHCount ?? 0,
      aromaticNeighbors,
      preferDoubleBond: donorCount > acceptorCount,
    });
  }
  return system;
}
