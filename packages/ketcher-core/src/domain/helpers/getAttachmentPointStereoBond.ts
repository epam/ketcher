import { Bond, SGroup } from 'domain/entities';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { SGroupAttachmentPoint } from 'domain/entities/sGroupAttachmentPoint';
import { getAttachmentPointLabel } from './attachmentPointCalculations';

/**
 * Helper function to find stereo bond information for an attachment point
 * by looking at the monomer's internal structure.
 * Returns the stereo value (UP or DOWN) if the bond between LGA and AA has stereo
 * and the narrow end is at the AA (attachment atom), otherwise returns null
 */
export function getAttachmentPointStereoBond(
  sGroup: SGroup,
  sGroupAttachmentPoint: SGroupAttachmentPoint,
): number | null {
  if (!(sGroup instanceof MonomerMicromolecule)) {
    return null;
  }

  const monomer = sGroup.monomer;
  if (!monomer?.monomerItem) {
    return null;
  }

  const monomerStruct = monomer.monomerItem.struct;
  const monomerAttachmentPoints = monomer.monomerItem.attachmentPoints;

  if (!monomerStruct || !monomerAttachmentPoints) {
    return null;
  }

  const attachmentPointNumber = sGroupAttachmentPoint.attachmentPointNumber;
  if (!attachmentPointNumber) {
    return null;
  }

  const attachmentPointLabel = getAttachmentPointLabel(attachmentPointNumber);
  const orderedAttachmentPoints = monomer.listOfAttachmentPoints;
  const attachmentPointIndex =
    orderedAttachmentPoints.indexOf(attachmentPointLabel);

  if (
    attachmentPointIndex === -1 ||
    attachmentPointIndex >= monomerAttachmentPoints.length
  ) {
    return null;
  }

  const monomerAttachmentPoint = monomerAttachmentPoints[attachmentPointIndex];
  if (!monomerAttachmentPoint) {
    return null;
  }

  const monomerAttachmentAtomId = monomerAttachmentPoint.attachmentAtom;
  const monomerLeavingGroupAtoms = monomerAttachmentPoint.leavingGroup?.atoms;

  if (
    monomerAttachmentAtomId === undefined ||
    !monomerLeavingGroupAtoms ||
    monomerLeavingGroupAtoms.length === 0
  ) {
    return null;
  }

  for (const internalLeavingAtomId of monomerLeavingGroupAtoms) {
    const bondId = monomerStruct.findBondId(
      internalLeavingAtomId,
      monomerAttachmentAtomId,
    );

    if (bondId === null) {
      continue;
    }

    const bond = monomerStruct.bonds.get(bondId);
    if (!bond) {
      continue;
    }

    const isSuitableStereoBond =
      bond.stereo === Bond.PATTERN.STEREO.UP ||
      bond.stereo === Bond.PATTERN.STEREO.DOWN;

    if (!isSuitableStereoBond) {
      continue;
    }

    if (bond.begin === monomerAttachmentAtomId) {
      return bond.stereo;
    }
  }

  return null;
}
