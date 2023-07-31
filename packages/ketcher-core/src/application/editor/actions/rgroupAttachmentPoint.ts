import assert from 'assert';
import { ReStruct } from 'application/render';
import { Struct } from 'domain/entities';
import {
  RGroupAttachmentPointAdd,
  RGroupAttachmentPointRemove,
} from '../operations';
import { Action } from './action';
import { fromAtomsAttrs } from '.';

export function fromRGroupAttachmentPointUpdate(
  restruct: ReStruct,
  atomId: number,
  attpnt,
) {
  const action = new Action();
  action.mergeWith(fromRGroupAttachmentPointsDeletionByAtom(restruct, atomId));
  action.mergeWith(fromRGroupAttachmentPointAddition(restruct, attpnt, atomId));
  return action;
}

export function fromRGroupAttachmentPointAddition(
  restruct: ReStruct,
  attpnt,
  atomId: number,
) {
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
  return action.perform(restruct);
}

function fromRGroupAttachmentPointsDeletionByAtom(
  restruct: ReStruct,
  atomId: number,
) {
  const action = new Action();
  const attachmentPointsToDelete =
    restruct.molecule.getRGroupAttachmentPointsByAtomId(atomId);
  attachmentPointsToDelete.forEach((rgroupAttachmentPointId) => {
    action.addOp(new RGroupAttachmentPointRemove(rgroupAttachmentPointId));
  });
  return action.perform(restruct);
}

export function fromRGroupAttachmentPointDeletion(
  restruct: ReStruct,
  id: number,
) {
  const { atomId, newAttpnt } = getNewAtomAttpnt(restruct.molecule, id);
  const actionToUpdateAtomsAttrs = fromAtomsAttrs(
    restruct,
    atomId,
    { attpnt: newAttpnt },
    null,
  );

  const actionToDeletePoint = new Action();
  actionToDeletePoint.addOp(new RGroupAttachmentPointRemove(id));

  return actionToDeletePoint
    .perform(restruct)
    .mergeWith(actionToUpdateAtomsAttrs);
}

function getNewAtomAttpnt(
  struct: Struct,
  rgroupAttachmentPointToDelete: number,
) {
  const pointToDelete = struct.rgroupAttachmentPoints.get(
    rgroupAttachmentPointToDelete,
  );
  assert(pointToDelete != null);
  const attachedAtomId = pointToDelete.atomId;
  const attachedAtom = struct.atoms.get(attachedAtomId);
  const currentAttpnt = attachedAtom?.attpnt;

  let newAttpnt = 0;
  if (currentAttpnt === 1 || currentAttpnt === 2) {
    newAttpnt = 0;
  } else if (currentAttpnt === 3) {
    const pointToDeleteType = pointToDelete.type;
    if (pointToDeleteType === 'primary') {
      newAttpnt = 2;
    } else if (pointToDeleteType === 'secondary') {
      newAttpnt = 1;
    }
  }

  return { atomId: attachedAtomId, newAttpnt };
}
