import type { ReStruct } from 'application/render';
import {
  AttachmentGroupAdd,
  AttachmentGroupDelete,
  BondDelete,
} from '../operations';
import { Action } from './action';

export function fromAttachmentGroupAddition(
  restruct: ReStruct,
  atomIds: number[],
): Action {
  const action = new Action();
  action.addOp(new AttachmentGroupAdd({ atomIds }).perform(restruct));
  return action;
}

export function fromAttachmentGroupDeletion(
  restruct: ReStruct,
  attachmentGroupId: number,
): Action {
  const action = new Action();

  restruct.molecule.bonds.forEach((bond, bondId) => {
    if (bond.begin === attachmentGroupId || bond.end === attachmentGroupId) {
      action.addOp(new BondDelete(bondId));
    }
  });
  action.addOp(new AttachmentGroupDelete(attachmentGroupId));

  return action.perform(restruct);
}
