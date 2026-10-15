import type { ReStruct } from 'application/render';
import {
  type ImageReferenceName,
  type ImageReferencePositionInfo,
  Image,
} from 'domain/entities/image';
import { Vec2 } from 'domain/entities/vec2';
import {
  ImageDelete,
  ImageMove,
  ImageResize,
  ImageUpsert,
} from '../operations/image';
import { Action } from './action';

const oppositeCorners: Partial<Record<ImageReferenceName, ImageReferenceName>> =
  {
    topLeftPosition: 'bottomRightPosition',
    topRightPosition: 'bottomLeftPosition',
    bottomRightPosition: 'topLeftPosition',
    bottomLeftPosition: 'topRightPosition',
  };

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
  let positionWithOffset = position.add(referencePositionInfo.offset);
  const oppositeCorner = oppositeCorners[referencePositionInfo.name];
  const image = reStruct.molecule.images.get(id);
  if (image && oppositeCorner) {
    const positions = image.getReferencePositions();
    const size = positions.bottomRightPosition.sub(positions.topLeftPosition);
    // Degenerate images retain the existing unconstrained resize behavior.
    if (size.x > 0 && size.y > 0) {
      const anchor = positions[oppositeCorner];
      const displacement = positionWithOffset.sub(anchor);
      const originalDisplacement =
        positions[referencePositionInfo.name].sub(anchor);
      const scale = Math.max(
        Math.abs(displacement.x) / size.x,
        Math.abs(displacement.y) / size.y,
      );
      positionWithOffset = anchor.add(
        new Vec2(
          (Math.sign(displacement.x) || Math.sign(originalDisplacement.x)) *
            size.x *
            scale,
          (Math.sign(displacement.y) || Math.sign(originalDisplacement.y)) *
            size.y *
            scale,
        ),
      );
    }
  }
  action.addOp(
    new ImageResize(id, positionWithOffset, referencePositionInfo.name),
  );
  return action.perform(reStruct);
}
