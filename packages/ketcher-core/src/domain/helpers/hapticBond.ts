import type { Atom } from 'domain/entities/atom';
import type { AttachmentGroup } from 'domain/entities/attachmentGroup';
import type { Bond } from 'domain/entities/bond';
import type { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { HAPTIC_BOND_TYPE } from 'domain/constants/bonds';

type HapticBondEndpoint = Pick<Atom, 'label'> | AttachmentGroup;

export const HAPTIC_BOND_ERROR_MESSAGE =
  'Haptic bonds are permitted only between an attachment group and a central atom, or between an atom and an element belonging to the transition metals, lanthanoids, or actinoids.';

export const ATTACHMENT_GROUP_HAPTIC_BOND_ERROR_MESSAGE =
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

export function isAttachmentGroup(
  endpoint?: HapticBondEndpoint | null,
): endpoint is AttachmentGroup {
  return !!endpoint && 'atomIds' in endpoint;
}

export function isAttachmentGroupId(struct: Struct, endpointId: number) {
  return struct.attachmentGroups.has(endpointId);
}

export function isHapticBondWithAttachmentGroup(
  struct: Struct,
  bond?: Pick<Bond, 'type' | 'begin' | 'end'> | null,
) {
  if (!bond || bond.type !== HAPTIC_BOND_TYPE) {
    return false;
  }

  return (
    isAttachmentGroupId(struct, bond.begin) ||
    isAttachmentGroupId(struct, bond.end)
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

  const attachmentGroupId = isAttachmentGroupId(struct, bond.begin)
    ? bond.begin
    : bond.end;
  const otherAtomId = attachmentGroupId === bond.begin ? bond.end : bond.begin;
  const attachmentGroup = struct.attachmentGroups.get(attachmentGroupId);
  const otherAtom = struct.getBondEndpoint(otherAtomId);

  if (!attachmentGroup || !otherAtom) {
    return null;
  }

  return Vec2.dist(pointer, attachmentGroup.pp) <=
    Vec2.dist(pointer, otherAtom.pp)
    ? attachmentGroupId
    : null;
}

export function isAttachmentGroupWithHapticBond(
  struct: Struct,
  attachmentGroupId: number,
) {
  if (!struct.attachmentGroups.has(attachmentGroupId)) {
    return false;
  }

  return struct.bonds.some(
    (bond) =>
      bond.type === HAPTIC_BOND_TYPE &&
      (bond.begin === attachmentGroupId || bond.end === attachmentGroupId),
  );
}

export function isAtomPartOfAttachmentGroup(struct: Struct, atomId: number) {
  return struct.attachmentGroups.some((attachmentGroup) =>
    attachmentGroup.atomIds.includes(atomId),
  );
}

export function isAllowedNonAttachmentGroupHapticBondMetal(
  atom?: Pick<Atom, 'label'> | null,
) {
  return !!atom && HAPTIC_BOND_ALLOWED_METALS.has(atom.label);
}

export function isHapticBondPairAllowed(
  beginAtom?: HapticBondEndpoint | null,
  endAtom?: HapticBondEndpoint | null,
) {
  if (!beginAtom || !endAtom) {
    return false;
  }

  const beginIsAttachmentGroup = isAttachmentGroup(beginAtom);
  const endIsAttachmentGroup = isAttachmentGroup(endAtom);

  if (beginIsAttachmentGroup || endIsAttachmentGroup) {
    return beginIsAttachmentGroup !== endIsAttachmentGroup;
  }

  const beginAtomIsAllowedMetal =
    isAllowedNonAttachmentGroupHapticBondMetal(beginAtom);
  const endAtomIsAllowedMetal =
    isAllowedNonAttachmentGroupHapticBondMetal(endAtom);

  return beginAtomIsAllowedMetal !== endAtomIsAllowedMetal;
}

export function isBondTypeAllowedForEndpoints(
  struct: Struct,
  bond: Pick<Bond, 'begin' | 'end'>,
  type: number,
) {
  const beginEndpoint = struct.getBondEndpoint(bond.begin);
  const endEndpoint = struct.getBondEndpoint(bond.end);

  if (type === HAPTIC_BOND_TYPE) {
    return isHapticBondPairAllowed(beginEndpoint, endEndpoint);
  }

  return !isAttachmentGroup(beginEndpoint) && !isAttachmentGroup(endEndpoint);
}

export function isAtomLabelAllowedByHapticBonds(
  struct: Struct,
  atomId: number,
  label: string,
) {
  const atom = struct.atoms.get(atomId);
  if (!atom) {
    return false;
  }

  const proposedAtom = { label };

  return !struct.bonds.some((bond) => {
    if (
      bond.type !== HAPTIC_BOND_TYPE ||
      (bond.begin !== atomId && bond.end !== atomId)
    ) {
      return false;
    }

    const beginEndpoint =
      bond.begin === atomId ? proposedAtom : struct.getBondEndpoint(bond.begin);
    const endEndpoint =
      bond.end === atomId ? proposedAtom : struct.getBondEndpoint(bond.end);

    return !isHapticBondPairAllowed(beginEndpoint, endEndpoint);
  });
}

export function isAtomMergeAllowedByHapticBonds(
  struct: Struct,
  sourceAtomId: number,
  destinationAtomId: number,
  mergedAtomLabel: string,
) {
  const mergedAtom = { label: mergedAtomLabel };

  return !struct.bonds.some((bond) => {
    if (
      bond.type !== HAPTIC_BOND_TYPE ||
      (![bond.begin, bond.end].includes(sourceAtomId) &&
        ![bond.begin, bond.end].includes(destinationAtomId))
    ) {
      return false;
    }

    if (
      [bond.begin, bond.end].includes(sourceAtomId) &&
      [bond.begin, bond.end].includes(destinationAtomId)
    ) {
      return false;
    }

    const getMergedEndpoint = (endpointId: number) => {
      return endpointId === sourceAtomId || endpointId === destinationAtomId
        ? mergedAtom
        : struct.getBondEndpoint(endpointId);
    };

    return !isHapticBondPairAllowed(
      getMergedEndpoint(bond.begin),
      getMergedEndpoint(bond.end),
    );
  });
}
