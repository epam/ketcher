import { ReStruct, ReRGroupAttachmentPoint } from 'application/render';
import assert from 'assert';
import {
  RGroupAttachmentPoint,
  RGroupAttachmentPointType,
} from 'domain/entities';
import { OperationPriority, OperationType } from '../OperationType';
import BaseOperation from '../BaseOperation';

type Data = {
  atomId: number;
  attachmentPointType: RGroupAttachmentPointType;
  attachmentPointId?: number;
};

class RGroupAttachmentPointAdd extends BaseOperation {
  readonly data: Data;

  constructor(data: Data) {
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
    return new RGroupAttachmentPointRemove(this.data.attachmentPointId);
  }
}

type RemoveData = {
  atomId: number;
  attachmentPointType;
  attachmentPointId: number;
};

const INITIAL_DATA = {
  atomId: 0,
  attachmentPointType: 1,
  attachmentPointId: 0,
};

class RGroupAttachmentPointRemove extends BaseOperation {
  readonly data: RemoveData;

  constructor(attachmentPointId: number) {
    super(
      OperationType.R_GROUP_ATTACHMENT_POINT_REMOVE,
      OperationPriority.R_GROUP_ATTACHMENT_POINT_REMOVE,
    );
    this.data = {
      ...INITIAL_DATA,
      attachmentPointId,
    };
  }

  execute(restruct: ReStruct) {
    const { attachmentPointId } = this.data;
    const struct = restruct.molecule;
    const item = struct.rgroupAttachmentPoints.get(attachmentPointId);
    const reItem = restruct.rgroupAttachmentPoints.get(attachmentPointId);
    assert(item != null && reItem != null);

    this.data.atomId = item.atomId;
    this.data.attachmentPointType = item.type;

    restruct.markItemRemoved();
    restruct.clearVisel(reItem.visel);
    restruct.rgroupAttachmentPoints.delete(attachmentPointId);

    struct.rgroupAttachmentPoints.delete(attachmentPointId);
  }

  invert() {
    return new RGroupAttachmentPointAdd(this.data);
  }
}

export { RGroupAttachmentPointAdd, RGroupAttachmentPointRemove };
