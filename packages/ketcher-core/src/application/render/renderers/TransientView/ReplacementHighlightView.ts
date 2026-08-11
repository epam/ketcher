import { TransientView } from 'application/render/renderers/TransientView/TransientView';
import type { D3SvgElementSelection } from 'application/render/types';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import {
  type Bounds,
  type MonomerHighlightShape,
  type Point,
  SegmentHighlightShape,
} from 'application/render/renderers/monomerHighlightShapes';

export type ReplacementHighlightViewParams = {
  /** The canvas monomers that will be replaced on drop. */
  monomers: BaseMonomer[];
};

/**
 * Colour of the replacement outline. Matches the macromolecules selection
 * accent so the "will be replaced" highlight reads as part of the same design
 * system.
 */
const OUTLINE_COLOR = '#0097A8';
/** Thickness (px, canvas space) of the outline stroke. */
const OUTLINE_THICKNESS = 2;
/** Distance (px, canvas space) the outline sits outside the monomer shapes. */
const OUTLINE_GAP = 4;
/** Half-width (px, canvas space) of the neck drawn along intra-preset bonds. */
const NECK_HALF_WIDTH = 4;
/** Sampling resolution (px, canvas space) of the contour extraction grid. */
const GRID_CELL = 2;

/**
 * Draws a single smooth path that outlines the whole group of monomers that
 * will be replaced by a drag-drop (a full preset, a subset of it, or one
 * monomer).
 *
 * Each monomer renderer owns the shape that outlines its body (via
 * `getHighlightShape`). This view collects those shapes, adds a neck shape
 * along every bond internal to the highlighted set, and unions them: the
 * combined silhouette is described as a signed-distance field whose zero-level
 * contour is extracted with marching squares, producing one continuous path
 * that hugs each shape and flows smoothly across the necks — without SVG
 * filters.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class ReplacementHighlightView extends TransientView {
  public static readonly viewName = 'ReplacementHighlightView';

  /**
   * Collects each monomer's own highlight shape plus a neck shape along every
   * bond internal to the highlighted set (bonds to unaffected neighbours are
   * left open, so the outline reflects exactly what will be replaced).
   */
  private static collectShapes(
    monomers: BaseMonomer[],
  ): MonomerHighlightShape[] {
    const shapes: MonomerHighlightShape[] = monomers.map((monomer) =>
      (monomer.renderer as BaseMonomerRenderer).getHighlightShape(),
    );

    const monomerSet = new Set(monomers);
    const processedBonds = new Set<PolymerBond>();

    for (const monomer of monomers) {
      const from = (monomer.renderer as BaseMonomerRenderer).center;

      for (const bond of Object.values(monomer.attachmentPointsToBonds)) {
        if (!(bond instanceof PolymerBond) || processedBonds.has(bond)) {
          continue;
        }
        const otherMonomer = bond.getAnotherMonomer(monomer);
        if (!otherMonomer || !monomerSet.has(otherMonomer)) {
          continue;
        }
        processedBonds.add(bond);
        const to = (otherMonomer.renderer as BaseMonomerRenderer).center;
        shapes.push(new SegmentHighlightShape(from, to, NECK_HALF_WIDTH));
      }
    }

    return shapes;
  }

  private static computeBounds(shapes: MonomerHighlightShape[]): Bounds {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const shape of shapes) {
      const bounds = shape.bounds();
      minX = Math.min(minX, bounds.minX);
      minY = Math.min(minY, bounds.minY);
      maxX = Math.max(maxX, bounds.maxX);
      maxY = Math.max(maxY, bounds.maxY);
    }

    const padding = OUTLINE_GAP + OUTLINE_THICKNESS + GRID_CELL * 2;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
    };
  }

  /**
   * Extracts the zero-level contour of `field` over the given bounds using
   * marching squares, returning closed loops of points.
   */
  private static extractContour(
    field: (point: Point) => number,
    bounds: Bounds,
  ): Point[][] {
    const { minX, minY, maxX, maxY } = bounds;
    const cols = Math.ceil((maxX - minX) / GRID_CELL);
    const rows = Math.ceil((maxY - minY) / GRID_CELL);

    const sampled: number[][] = [];
    for (let row = 0; row <= rows; row++) {
      sampled[row] = [];
      for (let col = 0; col <= cols; col++) {
        sampled[row][col] = field({
          x: minX + col * GRID_CELL,
          y: minY + row * GRID_CELL,
        });
      }
    }

    const interpolate = (
      x1: number,
      y1: number,
      v1: number,
      x2: number,
      y2: number,
      v2: number,
    ): Point => {
      const denominator = v1 - v2;
      const t = denominator === 0 ? 0.5 : v1 / denominator;
      return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
    };

    // Which pair(s) of cell edges the contour crosses, per marching-squares
    // case (corner bits: TL=8, TR=4, BR=2, BL=1).
    const caseEdges: Record<number, Array<[string, string]>> = {
      1: [['left', 'bottom']],
      2: [['bottom', 'right']],
      3: [['left', 'right']],
      4: [['top', 'right']],
      5: [
        ['top', 'left'],
        ['bottom', 'right'],
      ],
      6: [['top', 'bottom']],
      7: [['top', 'left']],
      8: [['top', 'left']],
      9: [['top', 'bottom']],
      10: [
        ['top', 'right'],
        ['bottom', 'left'],
      ],
      11: [['top', 'right']],
      12: [['left', 'right']],
      13: [['bottom', 'right']],
      14: [['left', 'bottom']],
    };

    const segments: Array<[Point, Point]> = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const topLeft = sampled[row][col];
        const topRight = sampled[row][col + 1];
        const bottomRight = sampled[row + 1][col + 1];
        const bottomLeft = sampled[row + 1][col];

        let caseIndex = 0;
        if (topLeft < 0) caseIndex |= 8;
        if (topRight < 0) caseIndex |= 4;
        if (bottomRight < 0) caseIndex |= 2;
        if (bottomLeft < 0) caseIndex |= 1;

        const edges = caseEdges[caseIndex];
        if (!edges) continue;

        const x0 = minX + col * GRID_CELL;
        const y0 = minY + row * GRID_CELL;
        const x1 = x0 + GRID_CELL;
        const y1 = y0 + GRID_CELL;

        const crossing: Record<string, Point> = {
          top: interpolate(x0, y0, topLeft, x1, y0, topRight),
          right: interpolate(x1, y0, topRight, x1, y1, bottomRight),
          bottom: interpolate(x0, y1, bottomLeft, x1, y1, bottomRight),
          left: interpolate(x0, y0, topLeft, x0, y1, bottomLeft),
        };

        for (const [edgeA, edgeB] of edges) {
          segments.push([crossing[edgeA], crossing[edgeB]]);
        }
      }
    }

    return ReplacementHighlightView.stitchSegments(segments);
  }

  /** Chains contour segments into ordered closed loops. */
  private static stitchSegments(segments: Array<[Point, Point]>): Point[][] {
    const keyOf = (point: Point) =>
      `${Math.round(point.x * 100) / 100},${Math.round(point.y * 100) / 100}`;
    const edgeKey = (a: string, b: string) =>
      a < b ? `${a}|${b}` : `${b}|${a}`;

    const nodes = new Map<string, { point: Point; links: string[] }>();
    const nodeFor = (key: string, point: Point) => {
      let node = nodes.get(key);
      if (!node) {
        node = { point, links: [] };
        nodes.set(key, node);
      }
      return node;
    };
    for (const [a, b] of segments) {
      const keyA = keyOf(a);
      const keyB = keyOf(b);
      if (keyA === keyB) continue;
      nodeFor(keyA, a).links.push(keyB);
      nodeFor(keyB, b).links.push(keyA);
    }

    const visitedEdges = new Set<string>();
    const loops: Point[][] = [];

    for (const [startKey, startNode] of nodes) {
      for (const firstNext of startNode.links) {
        if (visitedEdges.has(edgeKey(startKey, firstNext))) continue;

        const loop: Point[] = [startNode.point];
        visitedEdges.add(edgeKey(startKey, firstNext));
        let previousKey = startKey;
        let currentKey = firstNext;

        while (currentKey !== startKey) {
          const currentNode = nodes.get(currentKey);
          if (!currentNode) break;
          loop.push(currentNode.point);

          const nextKey =
            currentNode.links.find(
              (link) =>
                link !== previousKey &&
                !visitedEdges.has(edgeKey(currentKey, link)),
            ) ?? currentNode.links.find((link) => link !== previousKey);
          if (!nextKey) break;

          visitedEdges.add(edgeKey(currentKey, nextKey));
          previousKey = currentKey;
          currentKey = nextKey;
        }

        if (loop.length > 2) {
          loops.push(loop);
        }
      }
    }

    return loops;
  }

  private static toPathData(loops: Point[][]): string {
    return loops
      .map(
        (loop) =>
          `M ${loop
            .map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
            .join(' L ')} Z`,
      )
      .join(' ');
  }

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: ReplacementHighlightViewParams,
  ) {
    const monomers = params.monomers.filter(
      (monomer): monomer is BaseMonomer =>
        monomer.renderer instanceof BaseMonomerRenderer,
    );

    if (monomers.length === 0) {
      return;
    }

    // Each renderer contributes its own shape; necks along internal bonds join
    // them into one silhouette. The union is `min` of the shapes' signed
    // distances, inflated by the gap so the outline sits just outside the body.
    const shapes = ReplacementHighlightView.collectShapes(monomers);
    const field = (point: Point): number => {
      let minDistance = Infinity;
      for (const shape of shapes) {
        const distance = shape.signedDistance(point);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }
      return minDistance - OUTLINE_GAP;
    };
    const bounds = ReplacementHighlightView.computeBounds(shapes);
    const loops = ReplacementHighlightView.extractContour(field, bounds);
    const pathData = ReplacementHighlightView.toPathData(loops);

    if (!pathData) {
      return;
    }

    transientLayer
      .append('path')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', OUTLINE_COLOR)
      .attr('stroke-width', OUTLINE_THICKNESS)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('pointer-events', 'none');
  }
}
