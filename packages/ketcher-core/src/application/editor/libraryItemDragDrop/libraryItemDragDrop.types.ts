import type { AttachmentPointName } from 'domain/types';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { Command } from 'domain/entities/Command';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import type { InsertionEnds } from './insertion';

/**
Stores the context needed to reposition the dropped monomer after the user
picks attachment points in the connection modal (drag-drop path only).
Cleared once the bond is committed or the dialog is cancelled.
*/
export type InsertionSession = {
  /**
  Everything applied so far; inverted if the user cancels a dialog.
  */
  command: Command;
  ends: InsertionEnds;
  /**
  Dialog step: bond with the left/top original, then with the right/bottom one.
  */
  step: 'left' | 'right';
  drawingEntities: DrawingEntity[];
  lastMonomer: BaseMonomer;
};
export type DragDropModalContext = {
  /**
  Set when the dialog belongs to an insertion into a bond (issue #7925).
  */
  insertion?: InsertionSession;
  droppedMonomer: BaseMonomer;
  addedMonomers: BaseMonomer[];
  targetMonomer: BaseMonomer;
  targetAP: AttachmentPointName;
};
