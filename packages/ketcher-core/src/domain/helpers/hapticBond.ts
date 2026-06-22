import { Atom, type AtomAttributes } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import type { Struct } from 'domain/entities/struct';

type HapticBondAtomLike = Pick<AtomAttributes, 'label' | 'endpoints'> &
  Partial<Pick<Atom, 'label' | 'endpoints'>>;

export const HAPTIC_BOND_ERROR_MESSAGE =
  'Haptic bonds are permitted only between a super-attachment point and a central atom, or between an atom and an element belonging to the transition metals, lanthanoids, or actinoids.';

export const SAP_HAPTIC_BOND_ERROR_MESSAGE =
  'Super-attachment point can only participate in haptic bonds.';

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
