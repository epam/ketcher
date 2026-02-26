import { Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';

export const MonomerCreationAttachmentPointClickEvent =
  'MonomerCreationAttachmentPointClick';

export const MonomerCreationComponentStructureUpdateEvent =
  'MonomerCreationComponentStructureUpdate';

export type AttachmentPointClickData = {
  attachmentPointName: AttachmentPointName;
  position: Vec2;
};

export type RnaPresetComponentKey = 'base' | 'sugar' | 'phosphate';

export type ComponentStructureUpdateData = {
  componentKey: RnaPresetComponentKey;
  atomIds: number[];
  bondIds: number[];
};
