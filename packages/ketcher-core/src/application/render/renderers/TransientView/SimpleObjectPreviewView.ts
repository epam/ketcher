import type { D3SvgElementSelection } from 'application/render/types';
import { SELECTION_OUTLINE_COLOR } from 'application/render/renderers/constants';
import {
  getEllipseGeometry,
  getLineGeometry,
  getRectangleGeometry,
} from 'application/render/renderers/simpleObjectGeometry';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import type { Vec2 } from 'domain/entities/vec2';

export type SimpleObjectPreviewViewParams = {
  mode: SimpleObjectMode;
  start: Vec2;
  end: Vec2;
};

export class SimpleObjectPreviewView {
  public static readonly viewName = 'SimpleObjectPreviewView';

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: SimpleObjectPreviewViewParams,
  ) {
    const { mode, start, end } = params;
    const previewLayer = transientLayer
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', SELECTION_OUTLINE_COLOR)
      .attr('stroke-dasharray', '4 2')
      .attr('style', 'pointer-events: none');

    if (mode === SimpleObjectMode.rectangle) {
      const { x, y, width, height } = getRectangleGeometry([start, end]);
      previewLayer
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height);
    } else if (mode === SimpleObjectMode.ellipse) {
      const { cx, cy, rx, ry } = getEllipseGeometry([start, end]);
      previewLayer
        .append('ellipse')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('rx', rx)
        .attr('ry', ry);
    } else {
      const { x1, y1, x2, y2 } = getLineGeometry([start, end]);
      previewLayer
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2);
    }
  }
}
