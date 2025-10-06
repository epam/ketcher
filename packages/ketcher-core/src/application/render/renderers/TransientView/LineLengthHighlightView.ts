import { TransientView } from './TransientView';
import { D3SvgElementSelection } from 'application/render/types';

export type LineLengthHighlightViewParams = {
  currentPosition: number;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class LineLengthHighlightView extends TransientView {
  public static readonly viewName = 'LineLengthHighlightView';

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: LineLengthHighlightViewParams,
  ) {
    const { currentPosition } = params;

    const VERY_LARGE_VALUE = 100000; // Large enough to appear "infinite"

    // Dim everything to the left of 0
    transientLayer
      .append('rect')
      .attr('x', -VERY_LARGE_VALUE)
      .attr('y', -VERY_LARGE_VALUE)
      .attr('width', VERY_LARGE_VALUE)
      .attr('height', VERY_LARGE_VALUE * 2)
      .attr('fill', '#333333')
      .style('opacity', 0.05);

    // Dim everything to the right of currentPosition
    transientLayer
      .append('rect')
      .attr('x', currentPosition)
      .attr('y', -VERY_LARGE_VALUE)
      .attr('width', VERY_LARGE_VALUE)
      .attr('height', VERY_LARGE_VALUE * 2)
      .attr('fill', '#333333')
      .style('opacity', 0.05);
  }
}
