import { Vec2 } from 'domain/entities';

export const MonomerCreationAttachmentPointClickEvent =
  'MonomerCreationAttachmentPointClick';

export type AttachmentPointClickData = {
  atomId: number;
  atomLabel: string;
  attachmentPointName: string;
  position: Vec2;
};
