import { AttachmentGroupAdd } from './AttachmentGroupAdd';
import { AttachmentGroupDelete } from './AttachmentGroupDelete';

AttachmentGroupAdd.InverseConstructor = AttachmentGroupDelete;
AttachmentGroupDelete.InverseConstructor = AttachmentGroupAdd;

export { AttachmentGroupAdd, AttachmentGroupDelete };
export * from './AttachmentGroupAttr';
