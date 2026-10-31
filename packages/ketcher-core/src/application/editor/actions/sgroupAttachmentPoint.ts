import { Action } from './action';
import { SGroupAttachmentPointRemove } from '../operations';
import type Restruct from 'application/render/restruct/restruct';
import { isNumber } from 'lodash';

export function fromSgroupAttachmentPointRemove(
  restruct: Restruct,
  sgroupId: number,
  atomId: number,
  leaveAtomId?: number,
  shouldPerform = true,
) {
  let action = new Action();
  const struct = restruct.molecule;
  const sgroup = struct.sgroups.get(sgroupId);
  const atomAttachmentPoints = sgroup
    ?.getAttachmentPoints()
    .filter((attachmentPoint) => attachmentPoint.atomId === atomId);

  for (const attachmentPoint of atomAttachmentPoints ?? []) {
    if (
      sgroup &&
      (!isNumber(attachmentPoint.leaveAtomId) ||
        attachmentPoint.leaveAtomId === leaveAtomId)
    ) {
      action.addOp(new SGroupAttachmentPointRemove(sgroupId, attachmentPoint));
    }
  }

  if (shouldPerform) {
    action = action.perform(restruct);
  }

  return action;
}
