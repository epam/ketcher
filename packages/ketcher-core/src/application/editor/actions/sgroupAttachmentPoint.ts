import { Action } from './action';
import { SGroupAttachmentPointRemove } from '../operations';
import Restruct from 'application/render/restruct/restruct';
import { isNumber } from 'lodash';

export function fromSgroupAttachmentPointRemove(
  restruct: Restruct,
  sgroupId: number,
  atomId: number,
  leaveAtomId?: number,
  needPerform = true,
) {
  let action = new Action();
  const struct = restruct.molecule;
  const sgroup = struct.sgroups.get(sgroupId);
  const atomAttachmentPoints = sgroup
    ?.getAttachmentPoints()
    .filter((attachmentPoint) => attachmentPoint.atomId === atomId);

  atomAttachmentPoints?.forEach((attachmentPoint) => {
    if (
      sgroup &&
      (!isNumber(attachmentPoint.leaveAtomId) ||
        attachmentPoint.leaveAtomId === leaveAtomId)
    ) {
      action.addOp(new SGroupAttachmentPointRemove(sgroupId, attachmentPoint));
    }
  });

  if (needPerform) {
    action = action.perform(restruct);
  }

  return action;
}
