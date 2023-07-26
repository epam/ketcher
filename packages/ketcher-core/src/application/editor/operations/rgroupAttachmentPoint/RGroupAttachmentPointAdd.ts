import { ReStruct, ReRGroupAttachmentPoint } from 'application/render';
import assert from 'assert';
import {
  RGroupAttachmentPoint,
  RGroupAttachmentPointType,
} from 'domain/entities';
import { RGroupAttachmentPointRemove } from '.';
import { OperationPriority, OperationType } from '../OperationType';
import BaseOperation from '../base';

type Data = {
  atomId: number;
  attachmentPointType: RGroupAttachmentPointType;
  attachmentPointId?: number;
};

class RGroupAttachmentPointAdd extends BaseOperation {
  data: Data;

  constructor(data: Data) {
    super(
      OperationType.R_GROUP_ATTACHMENT_POINT_ADD,
      OperationPriority.R_GROUP_ATTACHMENT_POINT_ADD,
    );
    this.data = data;
  }

  execute(restruct: ReStruct) {
    const { atomId, attachmentPointType } = this.data;
    const item = new RGroupAttachmentPoint(atomId, attachmentPointType);

    const struct = restruct.molecule;
    const revertedItemId = this.data.attachmentPointId;
    let attachmentPointId = 0;
    if (revertedItemId === undefined) {
      const newId = struct.rgroupAttachmentPoints.add(item);
      attachmentPointId = newId;
    } else {
      struct.rgroupAttachmentPoints.set(revertedItemId, item);
      attachmentPointId = revertedItemId;
    }
    this.data.attachmentPointId = attachmentPointId;

    const reAtom = restruct.atoms.get(atomId);
    assert(reAtom != null);
    restruct.rgroupAttachmentPoints.set(
      attachmentPointId,
      new ReRGroupAttachmentPoint(item, reAtom),
    );
  }

  invert() {
    if (this.data.attachmentPointId === undefined) {
      throw Error(`Inverted attachmentPointId doesn't exist`);
    }
    return new RGroupAttachmentPointRemove(this.data.attachmentPointId);
  }
}

export { RGroupAttachmentPointAdd };
