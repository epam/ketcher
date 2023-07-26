export type RGroupAttachmentPointType = 'primary' | 'secondary';

export class RGroupAttachmentPoint {
  atomId: number;
  type: RGroupAttachmentPointType;

  constructor(atomId: number, type: RGroupAttachmentPointType) {
    this.atomId = atomId;
    this.type = type;
  }
}
