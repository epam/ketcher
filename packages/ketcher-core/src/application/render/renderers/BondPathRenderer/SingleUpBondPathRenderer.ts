import {
  SVGPathAttributes,
  BondVectors,
  StereoBondWidth,
} from 'application/render/renderers/BondPathRenderer/constants';
import { Vec2 } from 'domain/entities';
import { HalfEdge } from 'application/render/view-model/HalfEdge';
import { Bond, BondStereo, BondType } from 'domain/entities/CoreBond';

// Find a neighboring half-edge at the same atom where the neighbor bond is a
// Single Up bond whose wide end (secondAtom) is this atom. This mirrors the
// micro-mode findIncomingStereoUpBond logic in rebond.ts.
function findIncomingStereoUpHalfEdge(
  halfEdge: HalfEdge,
  currentBond: Bond,
): HalfEdge | undefined {
  for (const neighbor of [
    halfEdge.leftNeighborHalfEdge,
    halfEdge.rightNeighborHalfEdge,
  ]) {
    if (!neighbor) continue;
    const neighborBond = neighbor.bond;
    if (neighborBond === currentBond) continue;
    if (
      neighborBond.type === BondType.Single &&
      neighborBond.stereo === BondStereo.Up &&
      neighborBond.secondAtom === halfEdge.firstAtom
    ) {
      return neighbor;
    }
  }
  return undefined;
}

// Compute the two endpoint offsets for one end of a bold-stereo parallelogram.
// Mirrors stereoUpBondGetCoordinates from rebond.ts.
function getBoldStereoEndpoints(
  halfEdgeDir: Vec2,
  neighborHalfEdgeDir: Vec2,
  atomPos: Vec2,
): [Vec2, Vec2] {
  const cos = Vec2.dot(halfEdgeDir, neighborHalfEdgeDir);
  const sin = Vec2.cross(halfEdgeDir, neighborHalfEdgeDir);
  const cosHalf = Math.sqrt(0.5 * (1 - cos));
  const biss = neighborHalfEdgeDir.rotateSC(
    (sin >= 0 ? -1 : 1) * cosHalf,
    Math.sqrt(0.5 * (1 + cos)),
  );
  const denomAdd = 0.3;
  const scale = 0.7;
  const width = (scale * StereoBondWidth) / (cosHalf + denomAdd);
  const p1 = atomPos.addScaled(biss, width);
  const p2 = atomPos.addScaled(biss.negated(), width);
  return sin > 0 ? [p1, p2] : [p2, p1];
}

class SingleUpBondPathRenderer {
  static preparePaths(bondVectors: BondVectors): SVGPathAttributes[] {
    const { startPosition, endPosition, firstHalfEdge, secondHalfEdge } =
      bondVectors;
    const currentBond = firstHalfEdge.bond;

    // Check whether both ends of this bond have an adjacent Single Up bond
    // meeting them at their wide end. When true, render as a 4-point
    // parallelogram ("bold stereo") to match the micro-mode appearance.
    const startNeighbor = findIncomingStereoUpHalfEdge(
      firstHalfEdge,
      currentBond,
    );
    const endNeighbor = findIncomingStereoUpHalfEdge(
      secondHalfEdge,
      currentBond,
    );

    if (startNeighbor && endNeighbor) {
      const [a1, a2] = getBoldStereoEndpoints(
        firstHalfEdge.direction,
        startNeighbor.direction,
        startPosition,
      );
      const [a3, a4] = getBoldStereoEndpoints(
        secondHalfEdge.direction,
        endNeighbor.direction,
        endPosition,
      );

      const svgPath: SVGPathAttributes = {
        d: `
          M${a1.x},${a1.y}
          L${a2.x},${a2.y}
          L${a3.x},${a3.y}
          L${a4.x},${a4.y}
          Z
        `,
        attrs: {
          'stroke-width': '2',
        },
      };
      return [svgPath];
    }

    // Default: standard tapered triangle (wedge) shape
    const halfOfBondEndWidth = 0.7 * StereoBondWidth;
    const bondEndFirstPoint = endPosition.addScaled(
      firstHalfEdge.leftNormal,
      halfOfBondEndWidth,
    );
    const bondEndSecondPoint = endPosition.addScaled(
      firstHalfEdge.leftNormal,
      -halfOfBondEndWidth,
    );

    const svgPath: SVGPathAttributes = {
      d: `
          M${startPosition.x},${startPosition.y}
          L${bondEndFirstPoint.x},${bondEndFirstPoint.y}
          L${bondEndSecondPoint.x},${bondEndSecondPoint.y}
          Z
        `,
      attrs: {
        'stroke-width': '2',
      },
    };

    return [svgPath];
  }
}

export default SingleUpBondPathRenderer;
