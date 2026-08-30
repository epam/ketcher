import type { AttachmentPointName } from 'domain/types';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';

/**
 * Stores the context needed to reposition the dropped monomer after the user
 * picks attachment points in the connection modal (drag-drop path only).
 * Cleared once the bond is committed or the dialog is cancelled.
 */
export type DragDropModalContext = {
  droppedMonomer: BaseMonomer;
  addedMonomers: BaseMonomer[];
  targetMonomer: BaseMonomer;
  targetAP: AttachmentPointName;
};
