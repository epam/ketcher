import { ReStruct } from 'application/render';
import { ImageReferencePositionInfo, Vec2 } from 'domain/entities';
import {
  Action,
  ImageDelete,
  ImageMove,
  ImageResize,
  ImageUpsert,
} from 'application/editor';
import { Image } from 'domain/entities/image';

export function fromImageCreation(
  reStruct: ReStruct,
  bitmap: string,
  center: Vec2,
  halfSize: Vec2,
) {
  const action = new Action();
  const image = new Image(bitmap, center, halfSize);
  action.addOp(new ImageUpsert(image));
  return action.perform(reStruct);
}

export function fromImageDeletion(reStruct: ReStruct, id: number) {
  const action = new Action();
  action.addOp(new ImageDelete(id));
  return action.perform(reStruct);
}

export function fromImageMove(reStruct: ReStruct, id: number, offset: Vec2) {
  const action = new Action();
  action.addOp(new ImageMove(id, offset));
  return action.perform(reStruct);
}

export function fromImageResize(
  reStruct: ReStruct,
  id: number,
  position: Vec2,
  referencePositionInfo: ImageReferencePositionInfo,
) {
  const action = new Action();
  const positionWithOffset = position.add(referencePositionInfo.offset);
  action.addOp(
    new ImageResize(id, positionWithOffset, referencePositionInfo.name),
  );
  return action.perform(reStruct);
}
