import { Bond } from 'domain/entities/bond';
import type { SGroup } from 'domain/entities/sgroup';
import type { SGroupAttachmentPoint } from 'domain/entities/sGroupAttachmentPoint';
import { getAttachmentPointStereoBond } from './getAttachmentPointStereoBond';

/**
 * Finds the attachment point a bond between two monomers connects to.
 *
 * Chiral phosphates (Rsp, Rmp, Ssp, Smp) keep both of their attachment points
 * on the same phosphorus, so the attachment atom alone does not say which
 * attachment point a bond uses - the number the bond carries does.
 */
export function findAttachmentPointForBond(
  attachmentPoints: readonly SGroupAttachmentPoint[],
  bond: Bond,
  attachmentAtomId: number,
): SGroupAttachmentPoint | undefined {
  const attachmentPointsOnAtom = attachmentPoints.filter(
    (attachmentPoint) => attachmentPoint.atomId === attachmentAtomId,
  );
  const bondAttachmentPointNumber =
    bond.begin === attachmentAtomId
      ? bond.beginSuperatomAttachmentPointNumber
      : bond.endSuperatomAttachmentPointNumber;

  if (
    attachmentPointsOnAtom.length < 2 ||
    bondAttachmentPointNumber === undefined
  ) {
    return attachmentPointsOnAtom[0];
  }

  return (
    attachmentPointsOnAtom.find(
      (attachmentPoint) =>
        attachmentPoint.attachmentPointNumber === bondAttachmentPointNumber,
    ) ?? attachmentPointsOnAtom[0]
  );
}

/**
 * Returns the stereo bond to draw for an attachment point that has no stereo
 * bond of its own while another attachment point on the same atom has one.
 *
 * Both attachment points of a chiral phosphate share the stereocenter, and the
 * template marks only one of them, so the other bond is drawn with the opposite
 * wedge. That depicts the same configuration and keeps the stereocenter with
 * one UP and one DOWN bond instead of a single wedge.
 */
export function getOppositeAttachmentPointStereoBond(
  sGroup: SGroup,
  sGroupAttachmentPoint: SGroupAttachmentPoint,
): number | null {
  const attachmentPointOnSameAtom = sGroup
    .getAttachmentPoints()
    .find(
      (attachmentPoint) =>
        attachmentPoint !== sGroupAttachmentPoint &&
        attachmentPoint.atomId === sGroupAttachmentPoint.atomId,
    );

  if (!attachmentPointOnSameAtom) {
    return null;
  }

  const stereo = getAttachmentPointStereoBond(
    sGroup,
    attachmentPointOnSameAtom,
  );

  if (stereo === Bond.PATTERN.STEREO.UP) {
    return Bond.PATTERN.STEREO.DOWN;
  }

  if (stereo === Bond.PATTERN.STEREO.DOWN) {
    return Bond.PATTERN.STEREO.UP;
  }

  return null;
}
