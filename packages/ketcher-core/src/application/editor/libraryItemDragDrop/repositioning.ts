import { Vec2 } from 'domain/entities';
import { Command } from 'domain/entities/Command';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { AttachmentPointName } from 'domain/types';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { attachmentPointNumberToAngle } from 'domain/helpers/attachmentPointCalculations';
import { SnakeLayoutCellWidth } from 'domain/constants';
import { provideEditorSettings } from 'application/editor/editorSettings';
import {
  getNextMonomerInChain,
  getPreviousMonomerInChain,
} from 'domain/helpers/monomers';

/**
 * In Flex mode, after a drag-drop bond is established, reposition the
 * dropped monomer (and all monomers in its preset group) so that the new bond
 * has the standard bond length and follows the target AP direction.
 *
 * Formula (all values in model space / Å):
 *   droppedCenter = targetCenter + unitVector(apOutward) * (targetBodyRadius + bondLength + droppedBodyRadius)
 *
 * The offset delta is applied uniformly to all monomers in `addedMonomers`
 * so that a preset group moves as a rigid body.
 */
export function computeAndApplyFlexDropRepositioning(
  drawingEntitiesManager: DrawingEntitiesManager,
  droppedMonomer: BaseMonomer,
  addedMonomers: BaseMonomer[],
  targetMonomer: BaseMonomer,
  targetAttachmentPoint: AttachmentPointName,
): Command {
  const command = new Command();
  const editorSettings = provideEditorSettings();
  const bondLengthInAngstroms =
    SnakeLayoutCellWidth / editorSettings.macroModeScale;
  const attachmentPointAngleDegrees =
    attachmentPointNumberToAngle[targetAttachmentPoint];
  if (attachmentPointAngleDegrees === undefined) return command;

  const outwardAngleDeg = attachmentPointAngleDegrees - 180;
  const outwardAngleRad = (outwardAngleDeg * Math.PI) / 180;
  const unitVector = new Vec2(
    Math.cos(outwardAngleRad),
    Math.sin(outwardAngleRad),
  );

  // Target position for the dropped monomer's center in model space
  const targetCenter = targetMonomer.position;
  const desiredDroppedCenter = new Vec2(
    targetCenter.x + unitVector.x * bondLengthInAngstroms,
    targetCenter.y + unitVector.y * bondLengthInAngstroms,
  );

  // Compute the delta to move the entire dropped group
  const currentDroppedCenter = droppedMonomer.position;
  const delta = new Vec2(
    desiredDroppedCenter.x - currentDroppedCenter.x,
    desiredDroppedCenter.y - currentDroppedCenter.y,
  );

  // Apply the same delta to every monomer in the dropped group
  for (const monomer of addedMonomers) {
    const newPosition = new Vec2(
      monomer.position.x + delta.x,
      monomer.position.y + delta.y,
    );
    command.merge(drawingEntitiesManager.moveMonomer(monomer, newPosition));
    monomer.polymerBonds.forEach((polymerBond) => {
      drawingEntitiesManager.movePolymerBond(polymerBond);
    });
  }

  return command;
}

/**
 * Mirror the dropped preset horizontally around the bond insertion point
 * when both bonded ends are on the same topology side (req. 3.3.1).
 *
 * A monomer is "first" in its chain when it has no R2→R1 predecessor
 * (getPreviousMonomerInChain returns undefined). It is "last" when it
 * has no R2 successor (getNextMonomerInChain returns undefined).
 *
 * If both `droppedMonomer` and `targetMonomer` are first, or both are last,
 * the preset is mirrored by negating the x-offset of each preset monomer
 * relative to `droppedMonomer`'s current position (set by repositioning).
 */
export function applyPresetMirroringIfNeeded(
  drawingEntitiesManager: DrawingEntitiesManager,
  droppedMonomer: BaseMonomer,
  addedMonomers: BaseMonomer[],
  targetMonomer: BaseMonomer,
): Command {
  const command = new Command();

  const droppedIsFirst =
    getPreviousMonomerInChain(droppedMonomer) === undefined;
  const droppedIsLast = getNextMonomerInChain(droppedMonomer) === undefined;
  const targetIsFirst = getPreviousMonomerInChain(targetMonomer) === undefined;
  const targetIsLast = getNextMonomerInChain(targetMonomer) === undefined;

  const shouldMirror =
    (droppedIsFirst && targetIsFirst) || (droppedIsLast && targetIsLast);

  if (!shouldMirror) return command;

  // Mirror each preset monomer's x-offset relative to droppedMonomer's center
  const pivotX = droppedMonomer.position.x;
  for (const monomer of addedMonomers) {
    const offsetX = monomer.position.x - pivotX;
    const newPos = new Vec2(pivotX - offsetX, monomer.position.y);
    command.merge(drawingEntitiesManager.moveMonomer(monomer, newPos));
  }

  return command;
}
