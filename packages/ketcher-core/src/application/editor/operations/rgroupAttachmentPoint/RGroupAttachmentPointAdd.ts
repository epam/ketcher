import { type ReStruct, ReRGroupAttachmentPoint } from 'application/render';
import assert from 'assert';
import {
  type RGroupAttachmentPointType,
  RGroupAttachmentPoint,
} from 'domain/entities';
import { OperationPriority, OperationType } from '../OperationType';
import BaseOperation from '../BaseOperation';

type Data = {
  atomId: number;
  attachmentPointType: RGroupAttachmentPointType;
  attachmentPointId?: number;
};

const INITIAL_DATA: Data = {
  atomId: 0,
  attachmentPointType: 'primary',
  attachmentPointId: undefined,
};

class RGroupAttachmentPointAdd extends BaseOperation {
  readonly data: Data;

  constructor(data: Data = INITIAL_DATA) {
    super(
      OperationType.R_GROUP_ATTACHMENT_POINT_ADD,
      OperationPriority.R_GROUP_ATTACHMENT_POINT_ADD,
    );
    this.data = data;
  }

  execute(restruct: ReStruct) {
    const { atomId, attachmentPointType } = this.data;
    const newAttachmentPoint = new RGroupAttachmentPoint(
      atomId,
      attachmentPointType,
    );

    const struct = restruct.molecule;
    const revertedId = this.data.attachmentPointId;
    let attachmentPointId = 0;
    if (revertedId === undefined) {
      const newId = struct.rgroupAttachmentPoints.add(newAttachmentPoint);
      attachmentPointId = newId;
    } else {
      struct.rgroupAttachmentPoints.set(revertedId, newAttachmentPoint);
      attachmentPointId = revertedId;
    }
    this.data.attachmentPointId = attachmentPointId;

    const reAtom = restruct.atoms.get(atomId);
    assert(reAtom != null);
    restruct.rgroupAttachmentPoints.set(
      attachmentPointId,
      new ReRGroupAttachmentPoint(newAttachmentPoint, reAtom),
    );
  }

  invert() {
    if (this.data.attachmentPointId === undefined) {
      throw Error(`Inverted attachmentPointId doesn't exist`);
    }
    const inverted = new RGroupAttachmentPointAdd.InverseConstructor();
    inverted.data = this.data;
    return inverted;
  }
}

export { RGroupAttachmentPointAdd };
