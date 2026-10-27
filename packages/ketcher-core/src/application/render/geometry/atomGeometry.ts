import { Vec2 } from 'domain/entities/vec2';
import type { Box2Abs } from 'domain/entities/box2Abs';
import type { RGroupAttachmentPointType } from 'domain/entities/rgroupAttachmentPoint';
import util from 'application/render/util';

export const ATTACHMENT_POINT_OUTLINE_PADDING = 0.15;

export function findLargestSector(neighborAngles: readonly number[]) {
  const angles = [...neighborAngles].sort((a, b) => a - b);
  let neighborAngle = -Math.PI / 2;
  let largestAngle = 0;
  angles.forEach((angle, index) => {
    const next =
      index === angles.length - 1 ? angles[0] + 2 * Math.PI : angles[index + 1];
    if (next - angle > largestAngle) {
      neighborAngle = angle;
      largestAngle = next - angle;
    }
  });
  return { neighborAngle, largestAngle };
}

export interface AttachmentPointNeighbor {
  angle: number;
  isTriple: boolean;
}

export function attachmentPointDirection(
  neighbors: readonly AttachmentPointNeighbor[],
  type: RGroupAttachmentPointType,
  both: boolean,
): Vec2 {
  let angle: number;
  if (neighbors.length === 1 && !both) {
    angle =
      neighbors[0].angle +
      (neighbors[0].isTriple ? Math.PI : (2 * Math.PI) / 3);
  } else {
    const sector = findLargestSector(neighbors.map(({ angle }) => angle));
    const fraction = both ? (type === 'primary' ? 1 / 3 : 2 / 3) : 1 / 2;
    angle = sector.neighborAngle + sector.largestAngle * fraction;
  }
  return new Vec2(Math.cos(angle), Math.sin(angle));
}

/** Distance to clear relative atom-label boxes along a canvas-space ray. */
export function atomLabelShift(
  position: Vec2,
  direction: Vec2,
  boxes: readonly Box2Abs[],
  ratio = 1,
): number {
  return boxes.reduce(
    (shift, box) =>
      Math.max(
        shift,
        util.shiftRayBox(position, direction, box.translate(position)) * ratio,
      ),
    0,
  );
}

/** Preserve space for both bond endpoints even with a wide atom label. */
export function limitBondLabelShift(
  shift: number,
  bondLength: number,
  padding: number,
): number {
  return Math.min(shift, Math.max(bondLength / 2 - padding, 0));
}

export interface AttachmentPointGeometry {
  atomPositionVector: Vec2;
  shiftedStemStart: Vec2;
  attachmentPointEnd: Vec2;
  labelPosition: Vec2;
}

export function attachmentPointGeometry(
  position: Vec2,
  direction: Vec2,
  scale: number,
  stemStart: Vec2,
): AttachmentPointGeometry {
  const nominalLength = scale * 0.85;
  const maxStartProjection = Math.max(
    nominalLength - ATTACHMENT_POINT_OUTLINE_PADDING * scale,
    0,
  );
  const projection = Vec2.dot(stemStart.sub(position), direction);
  return {
    atomPositionVector: position,
    shiftedStemStart:
      projection > maxStartProjection
        ? position.addScaled(direction, maxStartProjection)
        : stemStart,
    attachmentPointEnd: position.addScaled(direction, nominalLength),
    labelPosition: position
      .addScaled(direction.rotateSC(1, 0), 0.17 * scale)
      .addScaled(direction, 0.7 * scale),
  };
}
