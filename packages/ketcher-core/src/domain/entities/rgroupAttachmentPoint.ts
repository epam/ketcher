import { Struct } from '.';

export type RGroupAttachmentPointType = 'primary' | 'secondary';

export class RGroupAttachmentPoint {
  atomId: number;
  attachmentPointType: RGroupAttachmentPointType;

  constructor(atomId: number, attachmentPointType: RGroupAttachmentPointType) {
    this.atomId = atomId;
    this.attachmentPointType = attachmentPointType;
  }

  static getRGroupAttachmentPointsByAtomId(atomId: number, struct: Struct) {
    return struct.rgroupAttachmentPoints.filter(
      (_id, attachmentPoint) => attachmentPoint.atomId === atomId,
    );
  }
}
