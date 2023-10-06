import assert from 'assert';
import { RGroupAttachmentPoint } from './rgroupAttachmentPoint';

/**
 * This is data model for Sgrou attachment point.
 * each of the property is according to the specification of CT files for "SAP" instruction.
 * Implemented under requirements: https://github.com/epam/ketcher/issues/2467
 */
export class SGroupAttachmentPoint {
  /**
   * This is the index of the atom in the S-group that serves as the attachment point.
   */
  public readonly atomId: number;
  /**
   * This is the index of the atom that is being replaced or removed at the attachment point
   * when the S-group is connected to another structure.
   * If no atom is being replaced, this value should be set to zero.
   *
   * NOTE: The logic is not supported in the current implementation of Ketcher.
   * Only reading from file and saving to file.
   */
  public readonly leaveAtomId: number | undefined;
  /**
   * 2 character attachment identifier (for example, H or T for head/tail).
   * No validation of any kind is performed, and ‘ ’ is allowed.
   * ISIS/Desktop uses the first character as the ID of the leaving group
   * to attach if the bond between ooo and iii is deleted, and uses the second character
   * to indicate the sequence polarity: l for left, r for right, and x for none (a crosslink).
   *
   * NOTE: The logic is not supported in the current implementation of Ketcher.
   * Only reading from file and saving to file.
   */
  public readonly attachmentId: string | undefined;

  constructor(
    atomId: number,
    leaveAtomId: number | undefined,
    attachmentId: string | undefined,
  ) {
    this.atomId = atomId;
    this.leaveAtomId = leaveAtomId;
    this.attachmentId = attachmentId;
  }

  clone(atomIdMap: Map<number, number>): SGroupAttachmentPoint {
    const newAtomId = atomIdMap.get(this.atomId);
    assert(newAtomId != null);
    const newLeaveAtomId = atomIdMap.get(this.leaveAtomId as number);
    return new SGroupAttachmentPoint(
      newAtomId,
      newLeaveAtomId,
      this.attachmentId,
    );
  }

  /**
   * Trick: used for cloned struct for tooltips, for preview, for templates
   *
   * Why?
   * Currently, tooltips are implemented with removing sgroups (wrong implementation)
   * That's why we need to mark atoms as sgroup attachment points.
   *
   * If we change preview approach to flagged (option for showing sgroups without abbreviation),
   * then we will be able to remove this hack.
   */
  convertToRGroupAttachmentPointForDisplayPurpose(attachedAtomId: number) {
    return new RGroupAttachmentPoint(attachedAtomId, 'primary');
  }
}
