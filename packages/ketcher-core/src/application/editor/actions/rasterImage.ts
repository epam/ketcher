import { ReStruct } from 'application/render';
import { Vec2 } from 'domain/entities';
import {
  Action,
  RasterImageDelete,
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
