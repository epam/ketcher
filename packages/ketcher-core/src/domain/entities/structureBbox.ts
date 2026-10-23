import type { DrawingEntity } from 'domain/entities/DrawingEntity';

export interface StructureBbox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

// TODO create separate class for BoundingBox
export function getStructureBbox(
  drawingEntities: DrawingEntity[],
): StructureBbox {
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;

  drawingEntities.forEach((drawingEntity) => {
    const monomerPosition = drawingEntity.position;

    left = left ? Math.min(left, monomerPosition.x) : monomerPosition.x;
    right = right ? Math.max(right, monomerPosition.x) : monomerPosition.x;
    top = top ? Math.min(top, monomerPosition.y) : monomerPosition.y;
    bottom = bottom ? Math.max(bottom, monomerPosition.y) : monomerPosition.y;
  });

  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}
