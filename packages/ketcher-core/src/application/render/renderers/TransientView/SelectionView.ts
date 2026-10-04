import type { D3SvgElementSelection } from 'application/render/types';
import { SELECTION_OUTLINE_COLOR } from 'application/render/renderers/constants';
import { curveLinearClosed, line as d3Line } from 'd3';

export type SelectionRectangleViewParams = {
  type: 'rectangle';
  start: [x: number, y: number];
  width: number;
  height: number;
};

export type SelectionLassoViewParams = {
  type: 'lasso';
  path: [x: number, y: number][];
};

export type SelectionViewParams =
  SelectionRectangleViewParams | SelectionLassoViewParams;

export class SelectionView {
  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: SelectionViewParams,
  ) {
    if (params.type === 'rectangle') {
      const {
        start: [x, y],
        width,
        height,
      } = params;

      transientLayer
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('stroke', SELECTION_OUTLINE_COLOR)
        .attr('style', 'pointer-events: none');
      return;
    }

    if (params.type === 'lasso') {
      // A closed curve gives the same outline the molecules mode draws:
      // one path back to the starting point, without a filled area.
      const line = d3Line()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(curveLinearClosed);

      transientLayer
        .append('path')
        .datum(params.path)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', SELECTION_OUTLINE_COLOR)
        .attr('style', 'pointer-events: none');
    }
  }

  public static readonly viewName = 'SelectionView';
}
