import { TransientView } from 'application/render/renderers/TransientView/TransientView';
import type { D3SvgElementSelection } from 'application/render/types';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import {
  type HighlightPathData,
  createSegmentHighlightPath,
} from 'application/render/renderers/monomerHighlightShapes';
import paperjs from 'paper';

type UnitedPaperPath = {
  unite(path: InstanceType<typeof paperjs.CompoundPath>): UnitedPaperPath;
  remove(): void;
  pathData: string;
};

export type ReplacementHighlightViewParams = {
  /** The canvas monomers that will be replaced on drop. */
  monomers: BaseMonomer[];
};

/**
 * Colour of the replacement outline. Matches the macromolecules selection
 * accent so the "will be replaced" highlight reads as part of the same design
 * system.
 */
const OUTLINE_COLOR = '#167782';
/** Thickness (px, canvas space) of the outline stroke. */
const OUTLINE_THICKNESS = 1;
/** Distance (px, canvas space) the outline sits outside the monomer shapes. */
const OUTLINE_GAP = 6;
/** Half-width (px, canvas space) of the neck drawn along intra-preset bonds. */
const NECK_HALF_WIDTH = 0.6;
/**
 * Draws a single smooth path that outlines the whole group of monomers that
 * will be replaced by a drag-drop (a full preset, a subset of it, or one
 * monomer).
 *
 * Each monomer renderer owns the path that outlines its body (via
 * `getHighlightPath`). This view collects those paths, adds a capsule path
 * along every bond internal to the highlighted set, and uses Paper.js boolean
 * union to produce one continuous path that hugs each shape and flows smoothly
 * across the necks — without SVG filters or sampled SDF contouring.
 */
// @ts-ignore
export class ReplacementHighlightView extends TransientView {
  public static readonly viewName = 'ReplacementHighlightView';

  /**
   * Collects each monomer's own highlight path plus a neck path along every
   * bond internal to the highlighted set (bonds to unaffected neighbours are
   * left open, so the outline reflects exactly what will be replaced).
   */
  private static collectPathData(monomers: BaseMonomer[]): HighlightPathData[] {
    const pathData: HighlightPathData[] = monomers.map((monomer) =>
      (monomer.renderer as BaseMonomerRenderer).getHighlightPath(OUTLINE_GAP),
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
        pathData.push(
          createSegmentHighlightPath(from, to, NECK_HALF_WIDTH + OUTLINE_GAP),
        );
      }
    }

    return pathData;
  }

  private static getUnitedPathData(
    pathsData: HighlightPathData[],
  ): HighlightPathData | undefined {
    paperjs.setup(document.createElement('canvas'));

    let combinedPath: UnitedPaperPath | undefined;

    pathsData.forEach((pathData) => {
      const path = new paperjs.CompoundPath(pathData);

      if (!path.closed) {
        path.closePath();
      }

      if (!combinedPath) {
        combinedPath = path;
        return;
      }

      const unitedPath = combinedPath.unite(path);
      combinedPath.remove();
      path.remove();
      combinedPath = unitedPath;
    });

    return combinedPath?.pathData;
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

    const pathsData = ReplacementHighlightView.collectPathData(monomers);
    const pathData = ReplacementHighlightView.getUnitedPathData(pathsData);

    if (!pathData) {
      return;
    }

    transientLayer
      .append('path')
      .attr('d', pathData)
      .attr('fill', '#fff')
      .attr('opacity', '0.65')
      .attr('stroke', OUTLINE_COLOR)
      .attr('stroke-width', OUTLINE_THICKNESS)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('pointer-events', 'none');
  }
}
