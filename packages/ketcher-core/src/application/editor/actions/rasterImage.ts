import { ReStruct } from 'application/render';
import { RasterImageReferencePositionInfo, Vec2 } from 'domain/entities';
import {
  Action,
  RasterImageDelete,
  RasterImageMove,
  RasterImageResize,
  RasterImageUpsert,
} from 'application/editor';
import { RasterImage } from 'domain/entities/rasterImage';

export function fromRasterImageCreation(
  reStruct: ReStruct,
  bitmap: string,
  center: Vec2,
  halfSize: Vec2,
) {
  const action = new Action();
  const rasterImage = new RasterImage(bitmap, center, halfSize);
  action.addOp(new RasterImageUpsert(rasterImage));
  return action.perform(reStruct);
}

export function fromRasterImageDeletion(reStruct: ReStruct, id: number) {
  const action = new Action();
  action.addOp(new RasterImageDelete(id));
  return action.perform(reStruct);
}

export function fromRasterImageMove(
  reStruct: ReStruct,
  id: number,
  offset: Vec2,
) {
  const action = new Action();
  action.addOp(new RasterImageMove(id, offset));
  return action.perform(reStruct);
}

export function fromRasterImageResize(
  reStruct: ReStruct,
  id: number,
  position: Vec2,
  referencePositionInfo: RasterImageReferencePositionInfo,
) {
  const action = new Action();
  const positionWithOffset = position.add(referencePositionInfo.offset);
  action.addOp(
    new RasterImageResize(id, positionWithOffset, referencePositionInfo.name),
  );
  return action.perform(reStruct);
}
