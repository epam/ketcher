import { ReStruct } from 'application/render';
import {
  Action,
  MultitailArrowDelete,
  MultitailArrowUpsert,
  MultitailArrowMove,
  MultitailArrowAddTail,
  MultitailArrowRemoveTail,
} from 'application/editor';
import { Vec2, MultitailArrow } from 'domain/entities';

export function fromMultitailArrowCreation(
  reStruct: ReStruct,
  topLeft: Vec2,
  bottomRight: Vec2,
) {
  const action = new Action();
  const multitailArrow = MultitailArrow.fromTwoPoints(topLeft, bottomRight);
  action.addOp(new MultitailArrowUpsert(multitailArrow));
  return action.perform(reStruct);
}

export function fromMultitailArrowDeletion(reStruct: ReStruct, id: number) {
  const action = new Action();
  action.addOp(new MultitailArrowDelete(id));
  return action.perform(reStruct);
}

export function fromMultitailArrowMove(
  reStruct: ReStruct,
  id: number,
  offset: Vec2,
) {
  const action = new Action();

  action.addOp(new MultitailArrowMove(id, offset));
  return action.perform(reStruct);
}

export function fromMultitailArrowTailAdd(reStruct: ReStruct, id: number) {
  const action = new Action();

  action.addOp(new MultitailArrowAddTail(id));
  return action.perform(reStruct);
}

export function fromMultitailArrowTailRemove(
  reStruct: ReStruct,
  id: number,
  tailId: number,
) {
  const action = new Action();

  action.addOp(new MultitailArrowRemoveTail(id, tailId));
  return action.perform(reStruct);
}
