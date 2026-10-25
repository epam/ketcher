import {
  AttachmentGroup,
  type AttachmentGroupAttributes,
} from 'domain/entities';
import { ReAttachmentGroup, type ReStruct } from '../../../render';
import { BaseOperation } from '../BaseOperation';
import { OperationType } from '../OperationType';

type Data = {
  id: number | null | undefined;
  attachmentGroup:
    AttachmentGroupAttributes | AttachmentGroup | null | undefined;
};

export class AttachmentGroupAdd extends BaseOperation<Data> {
  data: Data;

  constructor(attachmentGroup?: AttachmentGroupAttributes) {
    super(OperationType.ATTACHMENT_GROUP_ADD);
    this.data = {
      id: undefined,
      attachmentGroup: attachmentGroup ?? undefined,
    };
  }

  execute(restruct: ReStruct) {
    const { attachmentGroup } = this.data;
    if (!attachmentGroup) return;

    const entity =
      attachmentGroup instanceof AttachmentGroup
        ? attachmentGroup
        : new AttachmentGroup(attachmentGroup);
    entity.recalculatePosition(restruct.molecule.atoms);

    const id =
      this.data.id == undefined
        ? restruct.molecule.addAttachmentGroup(entity)
        : this.data.id;
    if (this.data.id != undefined) {
      restruct.molecule.setAttachmentGroup(id, entity);
    }
    this.data.id = id;
    this.data.attachmentGroup = entity;

    restruct.attachmentGroups.set(id, new ReAttachmentGroup(entity));
    restruct.needRecalculateVisibleAtomsAndBonds = true;
    restruct.markAttachmentGroup(id, 1);
  }
}
