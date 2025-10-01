import { Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';

export const MonomerCreationAttachmentPointClickEvent =
  'MonomerCreationAttachmentPointClick';

export type AttachmentPointClickData = {
  attachmentPointName: AttachmentPointName;
  position: Vec2;
};
