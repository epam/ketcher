import type { ReStruct } from 'application/render';
import {
  AttachmentGroupAdd,
  AttachmentGroupDelete,
  BondDelete,
  CalcImplicitH,
} from '../operations';
import { Action } from './action';
import { fromFragmentSplit } from './fragment';

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
  let action = new Action();
  const atomIds = new Set<number>();
  const fragmentIds = new Set<number>();

  restruct.molecule.bonds.forEach((bond, bondId) => {
    if (bond.begin === attachmentGroupId || bond.end === attachmentGroupId) {
      const fragmentId = restruct.molecule.getBondFragment(bondId);
      if (fragmentId !== undefined) {
        fragmentIds.add(fragmentId);
      }
      [bond.begin, bond.end].forEach((endpointId) => {
        if (restruct.molecule.atoms.has(endpointId)) {
          atomIds.add(endpointId);
        }
      });
      action.addOp(new BondDelete(bondId));
    }
  });
  action.addOp(new AttachmentGroupDelete(attachmentGroupId));
  action = action.perform(restruct);

  if (atomIds.size > 0) {
    action.addOp(new CalcImplicitH([...atomIds]).perform(restruct));
  }

  fragmentIds.forEach((fragmentId) => {
    action = fromFragmentSplit(restruct, fragmentId).mergeWith(action);
  });

  return action;
}
