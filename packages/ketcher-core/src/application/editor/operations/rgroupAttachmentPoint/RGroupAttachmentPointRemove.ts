import { ReStruct } from 'application/render';
import assert from 'assert';
import { RGroupAttachmentPointType } from 'domain/entities';
import { OperationPriority, OperationType } from '../OperationType';
import BaseOperation from '../BaseOperation';
import type { Data as AddData } from './RGroupAttachmentPointAdd';

type RemoveData = {
  atomId: number;
  attachmentPointType: RGroupAttachmentPointType;
  attachmentPointId: number;
};

const INITIAL_DATA: RemoveData = {
  atomId: 0,
  attachmentPointType: 'primary',
  attachmentPointId: 0,
};

class RGroupAttachmentPointRemove extends BaseOperation {
  readonly data: RemoveData;
  static InverseConstructor: new (data?: AddData) => BaseOperation;

  constructor(attachmentPointId?: number) {
    super(
      OperationType.R_GROUP_ATTACHMENT_POINT_REMOVE,
      OperationPriority.R_GROUP_ATTACHMENT_POINT_REMOVE,
    );
    this.data = {
      ...INITIAL_DATA,
      attachmentPointId: attachmentPointId ?? 0,
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
    const inverted = new RGroupAttachmentPointRemove.InverseConstructor();
    inverted.data = this.data;
    return inverted;
  }
}

export { RGroupAttachmentPointRemove };
