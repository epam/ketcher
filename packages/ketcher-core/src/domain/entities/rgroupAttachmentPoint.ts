export type RGroupAttachmentPointType = 'primary' | 'secondary';

export class RGroupAttachmentPoint {
  atomId: number;
  type: RGroupAttachmentPointType;

  constructor(atomId: number, type: RGroupAttachmentPointType) {
    this.atomId = atomId;
    this.type = type;
  }

  clone(atomToNewAtom?: Map<number, number> | null) {
    const newAtomId = atomToNewAtom?.get(this.atomId);
    return new RGroupAttachmentPoint(newAtomId ?? this.atomId, this.type);
  }
}
