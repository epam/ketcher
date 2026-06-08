import { Action } from './action';
import { ReStruct } from '../../render';
import { BondDelete } from '../operations';
import {
  SuperAttachmentPointAdd,
  SuperAttachmentPointDelete,
  SuperAttachmentPointEndpointsChange,
} from '../operations/superAttachmentPoint';
import { Bond } from 'domain/entities/bond';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';

export function fromSuperAttachmentPointAddition(
  reStruct: ReStruct,
  endpoints: number[],
): { action: Action; superAttachmentPointAtomId: number } {
  const action = new Action();
  const op = new SuperAttachmentPointAdd(endpoints);
  action.addOp(op.perform(reStruct));
  return {
    action,
    superAttachmentPointAtomId: op.superAttachmentPointAtomId as number,
  };
}

export function fromSuperAttachmentPointDelete(
  reStruct: ReStruct,
  superAttachmentPointAtomId: number,
): Action {
  const action = new Action();
  const struct = reStruct.molecule;
  const superAttachmentPoint = struct.atoms.get(superAttachmentPointAtomId);
  if (!(superAttachmentPoint instanceof SuperAttachmentPoint)) return action;

  const incident: number[] = [];
  struct.bonds.forEach((bond, bid) => {
    if (
      bond.type === Bond.PATTERN.TYPE.HAPTIC &&
      (bond.begin === superAttachmentPointAtomId ||
        bond.end === superAttachmentPointAtomId)
    ) {
      incident.push(bid);
    }
  });
  for (const bid of incident) {
    action.addOp(new BondDelete(bid).perform(reStruct));
  }

  action.addOp(
    new SuperAttachmentPointDelete(superAttachmentPointAtomId).perform(
      reStruct,
    ),
  );
  return action;
}

export function fromSuperAttachmentPointEndpointsChange(
  reStruct: ReStruct,
  superAttachmentPointAtomId: number,
  newEndpoints: number[],
): Action {
  const action = new Action();
  const struct = reStruct.molecule;
  const superAttachmentPoint = struct.atoms.get(superAttachmentPointAtomId);
  if (!(superAttachmentPoint instanceof SuperAttachmentPoint)) return action;

  if (newEndpoints.length < 2) {
    return fromSuperAttachmentPointDelete(reStruct, superAttachmentPointAtomId);
  }

  for (const aid of newEndpoints) {
    const other = SuperAttachmentPoint.findForAtom(struct, aid);
    if (other && other.id !== superAttachmentPointAtomId) {
      return action;
    }
  }

  action.addOp(
    new SuperAttachmentPointEndpointsChange(
      superAttachmentPointAtomId,
      newEndpoints,
    ).perform(reStruct),
  );
  return action;
}
