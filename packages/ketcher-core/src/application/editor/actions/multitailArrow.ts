import { MultitailArrowReferencePosition, ReStruct } from 'application/render';
import {
  Action,
  MultitailArrowDelete,
  MultitailArrowUpsert,
  MultitailArrowMove,
  MultitailArrowAddTail,
  MultitailArrowRemoveTail,
  MultitailArrowResizeTailHead,
  MultitailArrowMoveHeadTail,
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

export function fromMultitailArrowHeadTailsResize(
  reStruct: ReStruct,
  id: number,
  ref: MultitailArrowReferencePosition,
  offset: number,
) {
  const action = new Action();
  action.addOp(
    new MultitailArrowResizeTailHead(id, offset, ref.name === 'head'),
  );
  return action.perform(reStruct);
}

export function fromMultitailArrowHeadTailMove(
  reStruct: ReStruct,
  id: number,
  ref: MultitailArrowReferencePosition,
  offset: number,
  normalize?: true,
) {
  const action = new Action();
  action.addOp(
    new MultitailArrowMoveHeadTail(id, offset, ref.name, ref.tailId, normalize),
  );
  return action.perform(reStruct);
}
