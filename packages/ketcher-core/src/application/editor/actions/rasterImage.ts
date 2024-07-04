import { ReStruct } from 'application/render';
import { Vec2 } from 'domain/entities';
import { Action, RasterImageUpsert } from 'application/editor';
import { RasterImage } from 'domain/entities/rasterImage';

export function fromRasterImageCreation(
  reStruct: ReStruct,
  bitmap: string,
  position: [Vec2, Vec2],
) {
  const action = new Action();
  const rasterImage = new RasterImage(bitmap, position);
  action.addOp(new RasterImageUpsert(rasterImage));
  return action.perform(reStruct);
}
