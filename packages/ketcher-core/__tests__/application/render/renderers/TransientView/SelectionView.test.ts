/** @jest-environment jsdom */

import {
  type SelectionViewParams,
  SelectionView,
} from 'application/render/renderers/TransientView/SelectionView';
import { SELECTION_OUTLINE_COLOR } from 'application/render/renderers/constants';
import { select } from 'd3';

const renderSelection = (params: SelectionViewParams): SVGSVGElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);
  select(svg).append('g').attr('class', 'transient-views-layer');
  const transientLayer = select<SVGGElement, void>('.transient-views-layer');
  SelectionView.show(transientLayer, params);
  return svg;
};

describe('SelectionView', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('draws the rectangle as an outline in the shared colour without a fill', () => {
    const svg = renderSelection({
      type: 'rectangle',
      start: [10, 20],
      width: 30,
      height: 40,
    });

    const rects = svg.querySelectorAll('rect');
    expect(rects).toHaveLength(1);
    expect(svg.querySelectorAll('path')).toHaveLength(0);

    const rect = rects[0];
    expect(rect.getAttribute('x')).toBe('10');
    expect(rect.getAttribute('y')).toBe('20');
    expect(rect.getAttribute('width')).toBe('30');
    expect(rect.getAttribute('height')).toBe('40');
    expect(rect.getAttribute('fill')).toBe('none');
    expect(rect.hasAttribute('fill-opacity')).toBe(false);
    expect(rect.getAttribute('stroke')).toBe(SELECTION_OUTLINE_COLOR);
    expect(rect.getAttribute('style')).toBe('pointer-events: none');
  });

  it('draws the lasso as a single closed outline without a fill', () => {
    const svg = renderSelection({
      type: 'lasso',
      path: [
        [0, 0],
        [50, 10],
        [20, 60],
      ],
    });

    const paths = svg.querySelectorAll('path');
    expect(paths).toHaveLength(1);

    const path = paths[0];
    const outline = path.getAttribute('d') ?? '';
    expect(outline.startsWith('M0,0')).toBe(true);
    expect(outline.endsWith('Z')).toBe(true);
    expect(path.getAttribute('fill')).toBe('none');
    expect(path.hasAttribute('fill-opacity')).toBe(false);
    expect(path.getAttribute('stroke')).toBe(SELECTION_OUTLINE_COLOR);
    expect(path.getAttribute('style')).toBe('pointer-events: none');
  });

  it('draws a lasso that has not moved away from its first point yet', () => {
    const svg = renderSelection({ type: 'lasso', path: [[5, 5]] });

    const paths = svg.querySelectorAll('path');
    expect(paths).toHaveLength(1);
    expect(paths[0].getAttribute('d')).toBe('M5,5Z');
  });
});
