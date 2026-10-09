import type { AttachmentGroup } from 'domain/entities';
import type { ReStruct } from '../../../render';
import { BaseOperation } from '../BaseOperation';
import { OperationPriority, OperationType } from '../OperationType';

type Data = {
  id?: number;
  attribute?: keyof AttachmentGroup;
  value?: unknown;
};

export class AttachmentGroupAttr extends BaseOperation {
  data: Data | null;
  data2: Data | null = null;

  constructor(id?: number, attribute?: keyof AttachmentGroup, value?: unknown) {
    super(
      OperationType.ATTACHMENT_GROUP_ATTR,
      OperationPriority.ATTACHMENT_GROUP_ATTR,
    );
    this.data = { id, attribute, value };
  }

  execute(restruct: ReStruct) {
    if (!this.data) return;
    const { id, attribute, value } = this.data;
    if (id === undefined || attribute === undefined) return;

    const attachmentGroup = restruct.molecule.attachmentGroups.get(id);
    if (!attachmentGroup) return;
    this.data2 ??= {
      id,
      attribute,
      value: Reflect.get(attachmentGroup, attribute),
    };

    Reflect.set(attachmentGroup, attribute, value);
    attachmentGroup.recalculatePosition(restruct.molecule.atoms);
    BaseOperation.invalidateItem(restruct, 'attachmentGroups', id, 1);
  }

  invert() {
    const inverted = new AttachmentGroupAttr();
    inverted.data = this.data2;
    inverted.data2 = this.data;
    return inverted;
  }
}
