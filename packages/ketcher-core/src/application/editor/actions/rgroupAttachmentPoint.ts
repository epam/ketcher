import { ReStruct } from 'application/render';
import {
  RGroupAttachmentPointAdd,
  RGroupAttachmentPointRemove,
} from '../operations';
import { Action } from './action';
import { Struct } from 'domain/entities';

function fromRGroupAttachmentPointUpdate(
  restruct: ReStruct,
  atomId: number,
  attpnt,
) {
  const action = new Action();
  action.mergeWith(
    fromRGroupAttachmentPointsDeletion(restruct.molecule, atomId),
  );
  action.mergeWith(fromRGroupAttachmentPointAddition(attpnt, atomId));
  return action.perform(restruct);
}

function fromRGroupAttachmentPointAddition(attpnt, atomId: number) {
  const action = new Action();
  switch (attpnt) {
    case 1:
      action.addOp(
        new RGroupAttachmentPointAdd({
          atomId,
          attachmentPointType: 'primary',
        }),
      );
      break;

    case 2:
      action.addOp(
        new RGroupAttachmentPointAdd({
          atomId,
          attachmentPointType: 'secondary',
        }),
      );
      break;

    case 3:
      action.addOp(
        new RGroupAttachmentPointAdd({
          atomId,
          attachmentPointType: 'primary',
        }),
      );
      action.addOp(
        new RGroupAttachmentPointAdd({
          atomId,
          attachmentPointType: 'secondary',
        }),
      );
      break;

    default:
      break;
  }
  return action;
}

function fromRGroupAttachmentPointsDeletion(struct: Struct, atomId: number) {
  const action = new Action();
  const attachmentPointsToDelete =
    struct.getRGroupAttachmentPointsByAtomId(atomId);
  attachmentPointsToDelete.forEach((rgroupAttachmentPointId) => {
    action.addOp(new RGroupAttachmentPointRemove(rgroupAttachmentPointId));
  });
  return action;
}

export { fromRGroupAttachmentPointUpdate };
