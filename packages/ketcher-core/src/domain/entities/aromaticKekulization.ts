import { DATIVE_VALENCE_TABLE } from 'domain/constants/dativeValence';

// Requirement 1.1 of #10427: dative valence of an aromatic atom is calculated on a
// Kekulé structure. This module assigns the Kekulé double bonds of one aromatic system
// without touching the molecule.

export interface KekuleAtom {
  label: string;
  charge: number;
  radicalCount: number;
  /** Sum of non-aromatic covalent bond orders (dative and hydrogen bonds excluded) */
  externalBondOrderSum: number;
  /** Explicitly set implicit hydrogen count, 0 when not set */
  fixedHydrogenCount: number;
  aromaticNeighbors: number[];
  /** Matched when possible, e.g. a dative donor in imidazole is the pyridine-like N */
  preferDoubleBond: boolean;
}

export type KekuleRole = 'mandatory' | 'optional' | 'forbidden';

// Upper bound on backtracking steps; aromatic systems in practice need far fewer.
const MAX_SEARCH_STEPS = 20000;

/**
 * Decides whether an aromatic atom takes a double bond in the Kekulé structure.
 * Only main-group atoms with an s+p valence shell (Or0 = 4) are supported; the
 * default valence follows the octet rule from the valence electron count n:
 * n <= 4 ? n : 8 - n (C 4, N 3, N+ 4, O 2, O+ 3, B 3, B- 4).
 * - n = 4 (C, Si, N+, B-): no lone pair, so the atom needs a double bond.
 * - otherwise (N, O, S, C-, C+, B): it may give a lone pair or an empty orbital to
 *   the ring instead, as in pyrrole, furan or tropylium.
 * Returns null for atoms this model does not describe.
 */
export function getKekuleRole(atom: KekuleAtom): KekuleRole | null {
  if (!Object.hasOwn(DATIVE_VALENCE_TABLE, atom.label)) {
    return null;
  }
  const config =
    DATIVE_VALENCE_TABLE[atom.label as keyof typeof DATIVE_VALENCE_TABLE];
  if (config.valenceOrbitals !== 4) {
    return null;
  }

  const electrons = config.valenceElectrons - atom.charge;
  if (electrons < 0 || electrons > 8) {
    return null;
  }
  const valence =
    (electrons <= 4 ? electrons : 8 - electrons) - atom.radicalCount;
  const freeValence =
    valence -
    atom.externalBondOrderSum -
    atom.aromaticNeighbors.length -
    atom.fixedHydrogenCount;

  if (freeValence < 1) {
    return 'forbidden';
  }
  return electrons === 4 ? 'mandatory' : 'optional';
}

/**
 * Finds the atoms that carry a Kekulé double bond in one aromatic system: a matching
 * over aromatic bonds that covers every mandatory atom and never uses a forbidden one.
 * Preferred atoms are matched if any valid structure allows all of them to be.
 * Returns null when no Kekulé structure exists or an atom is not supported.
 */
export function findKekuleDoubleBondAtoms(
  atoms: Map<number, KekuleAtom>,
): Set<number> | null {
  const roles = new Map<number, KekuleRole>();
  for (const [atomId, atom] of atoms) {
    const role = getKekuleRole(atom);
    if (!role) {
      return null;
    }
    roles.set(atomId, role);
  }

  const preferred = [...atoms.keys()].filter(
    (atomId) =>
      atoms.get(atomId)?.preferDoubleBond && roles.get(atomId) === 'optional',
  );
  if (preferred.length > 0) {
    const promotedRoles = new Map(roles);
    preferred.forEach((atomId) => promotedRoles.set(atomId, 'mandatory'));
    const matching = findMatching(atoms, promotedRoles);
    if (matching) {
      return matching;
    }
  }
  return findMatching(atoms, roles);
}

function findMatching(
  atoms: Map<number, KekuleAtom>,
  roles: Map<number, KekuleRole>,
): Set<number> | null {
  const isAvailable = (atomId: number) =>
    atoms.has(atomId) && roles.get(atomId) !== 'forbidden';
  const mandatory = [...roles.keys()].filter(
    (atomId) => roles.get(atomId) === 'mandatory',
  );
  const matched = new Set<number>();
  let steps = 0;

  const getFreePartners = (atomId: number) =>
    (atoms.get(atomId)?.aromaticNeighbors ?? []).filter(
      (neighborId) => isAvailable(neighborId) && !matched.has(neighborId),
    );

  const search = (): boolean | null => {
    if (++steps > MAX_SEARCH_STEPS) {
      return null;
    }

    // Most constrained mandatory atom first keeps the search close to linear.
    let nextAtomId: number | undefined;
    let nextPartners: number[] = [];
    for (const atomId of mandatory) {
      if (matched.has(atomId)) {
        continue;
      }
      const partners = getFreePartners(atomId);
      if (partners.length === 0) {
        return false;
      }
      if (nextAtomId === undefined || partners.length < nextPartners.length) {
        nextAtomId = atomId;
        nextPartners = partners;
      }
    }
    if (nextAtomId === undefined) {
      return true;
    }

    // Pairing two mandatory atoms leaves more room for the remaining ones.
    nextPartners.sort(
      (a, b) =>
        Number(roles.get(b) === 'mandatory') -
          Number(roles.get(a) === 'mandatory') || a - b,
    );
    matched.add(nextAtomId);
    for (const partnerId of nextPartners) {
      matched.add(partnerId);
      const result = search();
      if (result !== false) {
        return result;
      }
      matched.delete(partnerId);
    }
    matched.delete(nextAtomId);
    return false;
  };

  return search() ? matched : null;
}
