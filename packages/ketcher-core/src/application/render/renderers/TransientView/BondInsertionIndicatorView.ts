import type { D3SvgElementSelection } from 'application/render/types';
import type { Vec2 } from 'domain/entities/vec2';

export type BondInsertionIndicatorViewParams = {
  /**
  Centre of the circle in canvas-space pixels.
  */
  position: Vec2;
  /**
  `near` draws the small circle, `nearest` the bigger one.
  */
  level: 'near' | 'nearest';
};

export const BOND_INSERTION_INDICATOR_RADIUS: Record<
  BondInsertionIndicatorViewParams['level'],
  number
> = {
  near: 4,
  nearest: 8,
};

/**
 * Circle shown on a polymer bond while a library item is dragged close enough
 * to be inserted into it. It grows when the cursor gets closer.
 */
export class BondInsertionIndicatorView {
  public static readonly viewName = 'BondInsertionIndicatorView';

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: BondInsertionIndicatorViewParams,
  ) {
    transientLayer
      .append('circle')
      .attr('data-testid', 'bond-insertion-indicator')
      .attr('data-level', params.level)
      .attr('cx', params.position.x)
      .attr('cy', params.position.y)
      .attr('r', BOND_INSERTION_INDICATOR_RADIUS[params.level])
      .attr('fill', '#167782')
      .attr('fill-opacity', 0.35)
      .attr('stroke', '#167782')
      .attr('stroke-width', 1);
  }
}
