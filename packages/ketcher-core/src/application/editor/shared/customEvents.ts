import type { Vec2 } from 'domain/entities/vec2';
import type { AttachmentPointId } from 'application/render';
import type { AttachmentPointName } from 'domain/types';

export const MonomerCreationAttachmentPointClickEvent =
  'MonomerCreationAttachmentPointClick';

export const MonomerCreationComponentStructureUpdateEvent =
  'MonomerCreationComponentStructureUpdate';

export type AttachmentPointClickData = {
  attachmentPointId: AttachmentPointId;
  attachmentPointName: AttachmentPointName;
  position: Vec2;
};

export type RnaPresetComponentKey = 'base' | 'sugar' | 'phosphate';

export type ComponentStructureUpdateData = {
  componentKey: RnaPresetComponentKey;
  atomIds: number[];
  bondIds: number[];
};
