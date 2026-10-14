import type { AttachmentGroup } from 'domain/entities';
import type { ReStruct } from '../../../render';
import { BaseOperation } from '../BaseOperation';
import { OperationPriority, OperationType } from '../OperationType';

type Data = {
  id: number | null;
  attachmentGroup: AttachmentGroup | null;
};

export class AttachmentGroupDelete extends BaseOperation<Data> {
  data: Data;

  constructor(id?: number) {
    super(
      OperationType.ATTACHMENT_GROUP_DELETE,
      OperationPriority.ATTACHMENT_GROUP_DELETE,
    );
    this.data = { id: id ?? null, attachmentGroup: null };
  }

  execute(restruct: ReStruct) {
    const { id } = this.data;
    if (id === null) return;

    const attachmentGroup = restruct.molecule.attachmentGroups.get(id);
    if (!attachmentGroup) return;
    this.data.attachmentGroup ??= attachmentGroup;

    const reAttachmentGroup = restruct.attachmentGroups.get(id);
    if (reAttachmentGroup) restruct.clearVisel(reAttachmentGroup.visel);
    restruct.attachmentGroups.delete(id);
    restruct.visibleAttachmentGroups.delete(id);
    restruct.needRecalculateVisibleAtomsAndBonds = true;
    restruct.molecule.deleteAttachmentGroup(id);
    restruct.markItemRemoved();
  }
}
