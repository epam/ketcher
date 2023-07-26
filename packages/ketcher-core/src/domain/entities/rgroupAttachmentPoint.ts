export type RGroupAttachmentPointType = 'primary' | 'secondary';

export class RGroupAttachmentPoint {
  atomId: number;
  attachmentPointType: RGroupAttachmentPointType;

  constructor(atomId: number, attachmentPointType: RGroupAttachmentPointType) {
    this.atomId = atomId;
    this.attachmentPointType = attachmentPointType;
  }
}
