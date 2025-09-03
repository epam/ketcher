import { Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';

export const MonomerCreationAttachmentPointClickEvent =
  'MonomerCreationAttachmentPointClick';

export type AttachmentPointClickData = {
  atomId: number;
  atomLabel: string;
  attachmentPointName: AttachmentPointName;
  position: Vec2;
};
