import { Atom, type AtomAttributes } from 'domain/entities/atom';
import { Bond, type BondAttributes } from 'domain/entities/bond';
import { Pile } from 'domain/entities/pile';
import type { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

type HapticBondAtomLike = Pick<AtomAttributes, 'label' | 'endpoints'> &
  Partial<Pick<Atom, 'label' | 'endpoints'>>;

export const HAPTIC_BOND_ERROR_MESSAGE =
  'Haptic bonds are permitted only between an attachment group and a central atom, or between an atom and an element belonging to the transition metals, lanthanoids, or actinoids.';

export const SAP_HAPTIC_BOND_ERROR_MESSAGE =
  'Attachment groups can only participate in haptic bonds.';

export const HAPTIC_BOND_LENGTH_FACTOR = 1.8;

export function getHapticBondEndPosition(start: Vec2, end: Vec2) {
  return start.addScaled(Vec2.diff(end, start), HAPTIC_BOND_LENGTH_FACTOR);
}

const HAPTIC_BOND_ALLOWED_METALS = new Set([
  'Sc',
  'Ti',
  'V',
  'Cr',
  'Mn',
  'Fe',
  'Co',
  'Ni',
  'Cu',
  'Y',
  'Zr',
  'Nb',
  'Mo',
  'Tc',
  'Ru',
  'Rh',
  'Pd',
  'Ag',
  'La',
  'Ce',
  'Pr',
  'Nd',
  'Pm',
  'Sm',
  'Eu',
  'Gd',
  'Tb',
  'Dy',
  'Ho',
  'Er',
  'Tm',
  'Yb',
  'Lu',
  'Hf',
  'Ta',
  'W',
  'Re',
  'Os',
  'Ir',
  'Pt',
  'Au',
  'Ac',
  'Th',
  'Pa',
  'U',
  'Np',
  'Pu',
  'Am',
  'Cm',
  'Bk',
  'Cf',
  'Es',
  'Fm',
  'Md',
  'No',
  'Lr',
  'Rf',
  'Db',
  'Sg',
  'Bh',
  'Hs',
  'Mt',
  'Ds',
  'Rg',
  'Cn',
]);

export function isSuperAttachmentPointAtom(atom?: HapticBondAtomLike | null) {
  return atom?.label === '*' && (atom.endpoints?.length ?? 0) > 0;
}

export function isSuperAttachmentPointById(struct: Struct, atomId: number) {
  const atom = struct.atoms.get(atomId);
  return isSuperAttachmentPointAtom(atom);
}

export function isHapticBondWithAttachmentGroup(
  struct: Struct,
  bond?: Pick<Bond, 'type' | 'begin' | 'end'> | null,
) {
  if (!bond || bond.type !== Bond.PATTERN.TYPE.HAPTIC) {
    return false;
  }

  return (
    isSuperAttachmentPointById(struct, bond.begin) ||
    isSuperAttachmentPointById(struct, bond.end)
  );
}

export function getAttachmentGroupIdForHapticBondHalf(
  struct: Struct,
  bond: Pick<Bond, 'type' | 'begin' | 'end'> | null | undefined,
  pointer: Vec2,
): number | null {
  if (!isHapticBondWithAttachmentGroup(struct, bond) || !bond) {
    return null;
  }

  const attachmentGroupId = isSuperAttachmentPointById(struct, bond.begin)
    ? bond.begin
    : bond.end;
  const otherAtomId = attachmentGroupId === bond.begin ? bond.end : bond.begin;
  const attachmentGroup = struct.atoms.get(attachmentGroupId);
  const otherAtom = struct.atoms.get(otherAtomId);

  if (!attachmentGroup || !otherAtom) {
    return null;
  }

  return Vec2.dist(pointer, attachmentGroup.pp) <=
    Vec2.dist(pointer, otherAtom.pp)
    ? attachmentGroupId
    : null;
}

export function isSuperAttachmentPointWithHapticBond(
  struct: Struct,
  atomId: number,
) {
  const atom = struct.atoms.get(atomId);

  if (!isSuperAttachmentPointAtom(atom)) {
    return false;
  }

  return Atom.getConnectedBondIds(struct, atomId).some((bondId) => {
    const bond = struct.bonds.get(bondId);

    return bond?.type === Bond.PATTERN.TYPE.HAPTIC;
  });
}

export function isSuperAttachmentPointExcludedFromSelection(
  atom?: HapticBondAtomLike | null,
) {
  return isSuperAttachmentPointAtom(atom);
}

export function isAtomPartOfSuperAttachmentPoint(
  struct: Struct,
  atomId: number,
) {
  const atom = struct.atoms.get(atomId);

  if (isSuperAttachmentPointAtom(atom)) {
    return true;
  }

  return struct.atoms.some(
    (otherAtom) =>
      isSuperAttachmentPointAtom(otherAtom) &&
      otherAtom.endpoints.includes(atomId),
  );
}

export function isAllowedNonSapHapticBondMetal(
  atom?: HapticBondAtomLike | null,
) {
  return !!atom && HAPTIC_BOND_ALLOWED_METALS.has(atom.label);
}

export function isHapticBondPairAllowed(
  beginAtom?: HapticBondAtomLike | null,
  endAtom?: HapticBondAtomLike | null,
) {
  if (!beginAtom || !endAtom) {
    return false;
  }

  const beginAtomIsSap = isSuperAttachmentPointAtom(beginAtom);
  const endAtomIsSap = isSuperAttachmentPointAtom(endAtom);

  if (beginAtomIsSap || endAtomIsSap) {
    return beginAtomIsSap !== endAtomIsSap;
  }

  const beginAtomIsAllowedMetal = isAllowedNonSapHapticBondMetal(beginAtom);
  const endAtomIsAllowedMetal = isAllowedNonSapHapticBondMetal(endAtom);

  return beginAtomIsAllowedMetal !== endAtomIsAllowedMetal;
}

export function remapEndpointAtomIds(
  endpoints: number[],
  idMap: Map<number, number>,
): number[] {
  const remapped: number[] = [];
  endpoints.forEach((endpointAtomId) => {
    const newId = idMap.get(endpointAtomId);
    if (newId !== undefined) {
      remapped.push(newId);
    }
  });
  return remapped;
}

export function prepareHapticBondAttributes<T extends Partial<BondAttributes>>(
  bond: T,
  beginAtom?: Pick<Atom, 'endpoints'> | null,
  endAtom?: Pick<Atom, 'endpoints'> | null,
): T {
  if (bond.type !== Bond.PATTERN.TYPE.HAPTIC) {
    return bond;
  }

  let preparedBond: T = {
    ...bond,
    attach: 'ALL',
  };

  if (beginAtom?.endpoints.length) {
    preparedBond = {
      ...preparedBond,
      endpoints: beginAtom.endpoints,
    };
  } else if (endAtom?.endpoints.length) {
    preparedBond = {
      ...preparedBond,
      endpoints: endAtom.endpoints,
    };
  }

  return preparedBond;
}

export function recalculateSuperAttachmentPointPosition(
  atom: Pick<Atom, 'label' | 'endpoints' | 'pp'>,
  struct: Struct,
) {
  if (!isSuperAttachmentPointAtom(atom)) {
    return;
  }

  const positions = atom.endpoints.map(
    (atomId) => struct.atoms.get(atomId)?.pp || Vec2.ZERO,
  );

  atom.pp = positions
    .reduce((acc, pos) => acc.add(pos))
    .scaled(1 / positions.length);
}

export function mergeHapticBondFragments(struct: Struct) {
  struct.bonds.forEach((bond) => {
    if (bond.type !== Bond.PATTERN.TYPE.HAPTIC || !bond.endpoints?.length) {
      return;
    }

    const involvedAtomIds = [bond.begin, bond.end, ...bond.endpoints];
    const fragmentIds = new Pile<number>();
    involvedAtomIds.forEach((aid) => {
      const atom = struct.atoms.get(aid);
      if (atom && atom.fragment >= 0) {
        fragmentIds.add(atom.fragment);
      }
    });

    if (fragmentIds.size <= 1) {
      return;
    }

    const [targetFragmentId, ...fragmentsToMerge] = Array.from(fragmentIds);
    const fragmentsToMergeSet = new Pile<number>(fragmentsToMerge);

    struct.atoms.forEach((atom) => {
      if (fragmentsToMergeSet.has(atom.fragment)) {
        atom.fragment = targetFragmentId;
      }
    });
    fragmentsToMerge.forEach((fragmentId) => struct.frags.delete(fragmentId));
  });
}
