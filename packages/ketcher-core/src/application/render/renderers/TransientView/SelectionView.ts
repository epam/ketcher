import { TransientView } from 'application/render/renderers/TransientView/TransientView';
import { D3SvgElementSelection } from 'application/render/types';
import { line as d3Line } from 'd3';

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
  | SelectionRectangleViewParams
  | SelectionLassoViewParams;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class SelectionView extends TransientView {
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
        .attr('fill', 'transparent')
        .attr('stroke', '#B4B9D6')
        .attr('style', 'pointer-events: none');
      return;
    }

    if (params.type === 'lasso') {
      const { path } = params;
      const line = d3Line()
        .x((d) => d[0])
        .y((d) => d[1]);
      transientLayer
        .append('path')
        .datum(path)
        .attr('d', line)
        .attr('fill', '#E1E5EA')
        .attr('fill-opacity', 0.5)
        .attr('stroke', '#B4B9D6')
        .attr('style', 'pointer-events: none');
      if (path.length > 1) {
        const linePoints = [path[0], path[path.length - 1]];
        transientLayer
          .append('path')
          .datum(linePoints)
          .attr('d', line)
          .attr('stroke', '#B4B9D6')
          .attr('style', 'pointer-events: none');
      }
    }
  }

  public static readonly viewName = 'SelectionView';
}
