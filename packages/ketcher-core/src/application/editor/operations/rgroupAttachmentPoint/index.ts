import { RGroupAttachmentPointAdd } from './RGroupAttachmentPointAdd';
import { RGroupAttachmentPointRemove } from './RGroupAttachmentPointRemove';

RGroupAttachmentPointAdd.InverseConstructor = RGroupAttachmentPointRemove;
RGroupAttachmentPointRemove.InverseConstructor = RGroupAttachmentPointAdd;

export { RGroupAttachmentPointAdd, RGroupAttachmentPointRemove };
