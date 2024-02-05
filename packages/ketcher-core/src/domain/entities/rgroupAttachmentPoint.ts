import {
  BaseMicromoleculeEntity,
  initiallySelectedType,
} from 'domain/entities/BaseMicromoleculeEntity';

export type RGroupAttachmentPointType = 'primary' | 'secondary';

export class RGroupAttachmentPoint extends BaseMicromoleculeEntity {
  atomId: number;
  type: RGroupAttachmentPointType;

  constructor(
    atomId: number,
    type: RGroupAttachmentPointType,
    initiallySelected?: initiallySelectedType,
  ) {
    super(initiallySelected);
    this.atomId = atomId;
    this.type = type;
  }

  clone(atomToNewAtom?: Map<number, number> | null) {
    const newAtomId = atomToNewAtom?.get(this.atomId);
    return new RGroupAttachmentPoint(
      newAtomId ?? this.atomId,
      this.type,
      this.initiallySelected,
    );
  }
}
