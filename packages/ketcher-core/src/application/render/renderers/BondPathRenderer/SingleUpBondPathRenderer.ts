import {
  type SVGPathAttributes,
  type BondVectors,
  StereoBondWidth,
} from 'application/render/renderers/BondPathRenderer/constants';
import { Vec2 } from 'domain/entities';
import type { HalfEdge } from 'application/render/view-model/HalfEdge';
import type { ViewModel } from 'application/render/view-model/ViewModel';
import { type Bond, BondStereo, BondType } from 'domain/entities/CoreBond';

function isSingleUpBond(bond: Bond): boolean {
  return bond.type === BondType.Single && bond.stereo === BondStereo.Up;
}

// A bond is "bold stereo" when both of its atoms are the wide end of a
// neighboring Single Up bond. Mirrors micro-mode checkStereoBold in rebond.ts
// (includeBoldStereoBond = false: only the wide-end match counts here).
function isBoldStereoBond(bond: Bond, viewModel: ViewModel): boolean {
  const halfEdges = viewModel.bondsToHalfEdges.get(bond);
  if (!halfEdges) {
    return false;
  }
  const [firstHalfEdge, secondHalfEdge] = halfEdges;
  return (
    Boolean(
      findIncomingStereoUpHalfEdge(firstHalfEdge, bond, false, viewModel),
    ) &&
    Boolean(
      findIncomingStereoUpHalfEdge(secondHalfEdge, bond, false, viewModel),
    )
  );
}

// Find a neighboring half-edge (at the same atom) belonging to a Single Up bond
// whose wide end (secondAtom) meets this atom. With includeBold, a neighboring
// bold-stereo bond also qualifies even if its wide end points elsewhere — this
// mirrors the includeBoldStereoBond branch of micro-mode findIncomingStereoUpBond.
function findIncomingStereoUpHalfEdge(
  halfEdge: HalfEdge,
  currentBond: Bond,
  includeBold: boolean,
  viewModel: ViewModel,
): HalfEdge | undefined {
  for (const neighbor of [
    halfEdge.leftNeighborHalfEdge,
    halfEdge.rightNeighborHalfEdge,
  ]) {
    if (!neighbor) {
      continue;
    }
    const neighborBond = neighbor.bond;
    if (neighborBond === currentBond || !isSingleUpBond(neighborBond)) {
      continue;
    }
    if (
      neighborBond.secondAtom === halfEdge.firstAtom ||
      (includeBold && isBoldStereoBond(neighborBond, viewModel))
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
  static preparePaths(
    bondVectors: BondVectors,
    viewModel: ViewModel,
  ): SVGPathAttributes[] {
    const { startPosition, endPosition, firstHalfEdge, secondHalfEdge } =
      bondVectors;
    const currentBond = firstHalfEdge.bond;

    // Neighbors used to align each end's wide edge. Mirrors micro-mode
    // neihbid1/neihbid2 (findIncomingUpBonds, includeBoldStereoBond = true):
    // a wide end shared with an adjacent up/bold bond is snapped to that
    // bond's edge so the join is seamless rather than leaving a sliver.
    const startNeighbor = findIncomingStereoUpHalfEdge(
      firstHalfEdge,
      currentBond,
      true,
      viewModel,
    );
    const endNeighbor = findIncomingStereoUpHalfEdge(
      secondHalfEdge,
      currentBond,
      true,
      viewModel,
    );

    // When both ends meet the wide end of a neighboring Single Up bond, this
    // bond is bold stereo: render it as a uniform 4-point parallelogram to
    // match micro mode instead of a tapered triangle.
    if (
      startNeighbor &&
      endNeighbor &&
      isBoldStereoBond(currentBond, viewModel)
    ) {
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

    // Standard wedge: narrow point at the start, wide base at the end. When the
    // wide end is shared with a neighboring up/bold bond, align the base to that
    // neighbor's edge so the join is seamless — mirrors the neihbid2 branch of
    // micro-mode getBondSingleUpPath.
    let bondEndFirstPoint: Vec2;
    let bondEndSecondPoint: Vec2;
    if (endNeighbor) {
      [bondEndFirstPoint, bondEndSecondPoint] = getBoldStereoEndpoints(
        secondHalfEdge.direction,
        endNeighbor.direction,
        endPosition,
      );
    } else {
      const halfOfBondEndWidth = 0.7 * StereoBondWidth;
      bondEndFirstPoint = endPosition.addScaled(
        firstHalfEdge.leftNormal,
        halfOfBondEndWidth,
      );
      bondEndSecondPoint = endPosition.addScaled(
        firstHalfEdge.leftNormal,
        -halfOfBondEndWidth,
      );
    }

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
