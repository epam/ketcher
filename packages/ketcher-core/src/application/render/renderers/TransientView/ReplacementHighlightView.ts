import { TransientView } from 'application/render/renderers/TransientView/TransientView';
import type { D3SvgElementSelection } from 'application/render/types';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';

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
/** Gap (px, canvas space) between the monomer silhouette and the outline. */
const OUTLINE_GAP = 4;
/** Thickness (px, canvas space) of the outline ring. */
const OUTLINE_THICKNESS = 2;
/**
 * Width (px, canvas space) of the invisible connectors drawn along intra-preset
 * bonds so the individual monomer silhouettes merge into one continuous shape
 * before the outline is generated.
 */
const CONNECTOR_WIDTH = 12;

const FILTER_ID = 'replacement-highlight-outline';

/**
 * Draws a single smooth outline that wraps around every monomer that will be
 * replaced by a drag-drop (a whole preset, a subset of it, or a single
 * monomer).
 *
 * Rather than outlining each monomer separately, the silhouettes of all
 * highlighted monomers — plus thick connectors along the bonds between them —
 * are rendered as one solid shape, then an SVG `feMorphology` filter turns that
 * combined silhouette into a smooth, continuous ring. This makes the highlight
 * hug each monomer's real shape (rounded square / diamond / circle) while
 * flowing smoothly across the necks between connected components.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class ReplacementHighlightView extends TransientView {
  public static readonly viewName = 'ReplacementHighlightView';

  private static appendOutlineFilter(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
  ) {
    const outerRadius = OUTLINE_GAP + OUTLINE_THICKNESS;
    const innerRadius = OUTLINE_GAP;

    const filter = transientLayer
      .append('defs')
      .append('filter')
      .attr('id', FILTER_ID)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    // Outer edge of the ring: dilate the combined silhouette by gap + thickness.
    filter
      .append('feMorphology')
      .attr('in', 'SourceAlpha')
      .attr('operator', 'dilate')
      .attr('radius', outerRadius)
      .attr('result', 'outer');
    //
    // // Inner edge of the ring: dilate the silhouette by just the gap.
    // filter
    //   .append('feMorphology')
    //   .attr('in', 'SourceAlpha')
    //   .attr('operator', 'dilate')
    //   .attr('radius', innerRadius)
    //   .attr('result', 'inner');
    //
    // // Ring = outer minus inner → a hollow band around the silhouette.
    // filter
    //   .append('feComposite')
    //   .attr('in', 'outer')
    //   .attr('in2', 'inner')
    //   .attr('operator', 'out')
    //   .attr('result', 'ring');
    //
    // // Paint the ring with the outline colour.
    // filter
    //   .append('feFlood')
    //   .attr('flood-color', OUTLINE_COLOR)
    //   .attr('result', 'color');
    // filter
    //   .append('feComposite')
    //   .attr('in', 'color')
    //   .attr('in2', 'ring')
    //   .attr('operator', 'in');
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

    ReplacementHighlightView.appendOutlineFilter(transientLayer);

    const silhouette = transientLayer
      .append('g')
      .attr('filter', `url(#${FILTER_ID})`)
      .attr('pointer-events', 'none');

    const monomerSet = new Set(monomers);
    const processedBonds = new Set<PolymerBond>();

    // 1. Bridge connected components with thick connectors so their outlines
    //    merge into one continuous shape (only bonds internal to the highlighted
    //    set are bridged — bonds to unaffected neighbours are left open).
    monomers.forEach((monomer) => {
      const renderer = monomer.renderer as BaseMonomerRenderer;
      const from = renderer.center;

      Object.values(monomer.attachmentPointsToBonds).forEach((bond) => {
        if (!(bond instanceof PolymerBond) || processedBonds.has(bond)) {
          return;
        }

        const otherMonomer = bond.getAnotherMonomer(monomer);
        if (!otherMonomer || !monomerSet.has(otherMonomer)) {
          return;
        }

        processedBonds.add(bond);
        const to = (otherMonomer.renderer as BaseMonomerRenderer).center;

        silhouette
          .append('line')
          .attr('x1', from.x)
          .attr('y1', from.y)
          .attr('x2', to.x)
          .attr('y2', to.y)
          .attr('stroke', '#000')
          .attr('stroke-width', CONNECTOR_WIDTH)
          .attr('stroke-linecap', 'round');
      });
    });

    // 2. Render each monomer's real silhouette (its body symbol) so the outline
    //    hugs the actual shape.
    monomers.forEach((monomer) => {
      const renderer = monomer.renderer as BaseMonomerRenderer;
      const position = renderer.scaledMonomerPosition;

      silhouette
        .append('g')
        .attr('transform', `translate(${position.x}, ${position.y})`)
        .append('use')
        .attr('href', renderer.monomerSymbolElementId)
        .attr('fill', '#000');
    });
  }
}
