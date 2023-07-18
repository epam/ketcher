import { ReStruct } from 'application/render';
import assert from 'assert';
import { RGroupAttachmentPointAdd } from '.';
import { OperationPriority, OperationType } from '../OperationType';
import BaseOperation from '../base';

type Data = { atomId: number; attachmentPointType; attachmentPointId: number };

const INITIAL_DATA = {
  atomId: 0,
  attachmentPointType: 1,
  attachmentPointId: 0,
};

class RGroupAttachmentPointRemove extends BaseOperation {
  data: Data;

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
    this.data.attachmentPointType = item.attachmentPointType;

    restruct.markItemRemoved();
    restruct.clearVisel(reItem.visel);
    restruct.rgroupAttachmentPoints.delete(attachmentPointId);

    struct.rgroupAttachmentPoints.delete(attachmentPointId);
  }

  invert() {
    return new RGroupAttachmentPointAdd(this.data);
  }
}

export { RGroupAttachmentPointRemove };
