import assert from 'assert';
import { ReStruct } from 'application/render';
import { AttachmentPoints, Struct } from 'domain/entities';
import {
  RGroupAttachmentPointAdd,
  RGroupAttachmentPointRemove,
} from '../operations';
import { Action } from './action';
import { fromAtomsAttrs } from '.';

export function fromRGroupAttachmentPointUpdate(
  restruct: ReStruct,
  atomId: number,
  attachmentPoints: AttachmentPoints | null,
) {
  const action = new Action();
  action.mergeWith(fromRGroupAttachmentPointsDeletionByAtom(restruct, atomId));
  action.mergeWith(
    fromRGroupAttachmentPointAddition(restruct, attachmentPoints, atomId),
  );
  return action;
}

export function fromRGroupAttachmentPointAddition(
  restruct: ReStruct,
  attachmentPoints: AttachmentPoints | null,
  atomId: number,
) {
  const action = new Action();
  switch (attachmentPoints) {
    case AttachmentPoints.FirstSideOnly:
      action.addOp(
        new RGroupAttachmentPointAdd({
          atomId,
          attachmentPointType: 'primary',
        }),
      );
      break;

    case AttachmentPoints.SecondSideOnly:
      action.addOp(
        new RGroupAttachmentPointAdd({
          atomId,
          attachmentPointType: 'secondary',
        }),
      );
      break;

    case AttachmentPoints.BothSides:
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
  const { atomId, newAttachmentPoints } = getNewAtomAttachmentPoints(
    restruct.molecule,
    id,
  );
  const actionToUpdateAtomsAttrs = fromAtomsAttrs(
    restruct,
    atomId,
    { attachmentPoints: newAttachmentPoints },
    null,
  );

  const actionToDeletePoint = new Action();
  actionToDeletePoint.addOp(new RGroupAttachmentPointRemove(id));

  return actionToDeletePoint
    .perform(restruct)
    .mergeWith(actionToUpdateAtomsAttrs);
}

function getNewAtomAttachmentPoints(
  struct: Struct,
  rgroupAttachmentPointToDelete: number,
) {
  const pointToDelete = struct.rgroupAttachmentPoints.get(
    rgroupAttachmentPointToDelete,
  );
  assert(pointToDelete != null);
  const attachedAtomId = pointToDelete.atomId;
  const attachedAtom = struct.atoms.get(attachedAtomId);
  const currentAttachmentPoints = attachedAtom?.attachmentPoints;

  let newAttachmentPoints = AttachmentPoints.None;
  if (currentAttachmentPoints === AttachmentPoints.BothSides) {
    const pointToDeleteType = pointToDelete.type;
    if (pointToDeleteType === 'primary') {
      newAttachmentPoints = AttachmentPoints.SecondSideOnly;
    } else if (pointToDeleteType === 'secondary') {
      newAttachmentPoints = AttachmentPoints.FirstSideOnly;
    }
  }

  return { atomId: attachedAtomId, newAttachmentPoints };
}
