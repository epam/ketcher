import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { RxnArrowRenderer } from 'application/render/renderers/RxnArrowRenderer';
import { RxnArrowMode, Vec2 } from 'domain/entities';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';

describe('RxnArrowRenderer', () => {
  let canvas: SVGSVGElement;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
  });

  afterEach(() => {
    canvas.remove();
  });

  it('highlights axis-aligned arrows while resizing', () => {
    const arrow = new RxnArrow(RxnArrowMode.OpenAngle, [
      new Vec2(0, 0),
      new Vec2(1, 0),
    ]);
    arrow.isResizing = true;

    const renderer = new RxnArrowRenderer(arrow);
    renderer.show();

    const arrowPath = canvas.querySelector('[data-testid="rxn-arrow"]');

    expect(arrowPath?.getAttribute('stroke')).toBe('#365CFF');
  });

  it('highlights vertically snapped arrows while resizing', () => {
    const arrow = new RxnArrow(RxnArrowMode.OpenAngle, [
      new Vec2(0, 0),
      new Vec2(0, -1),
    ]);
    arrow.isResizing = true;

    const renderer = new RxnArrowRenderer(arrow);
    renderer.show();

    const arrowPath = canvas.querySelector('[data-testid="rxn-arrow"]');

    expect(arrowPath?.getAttribute('stroke')).toBe('#365CFF');
  });

  it('keeps the default color when the arrow is not resizing', () => {
    const arrow = new RxnArrow(RxnArrowMode.OpenAngle, [
      new Vec2(0, 0),
      new Vec2(1, 0),
    ]);

    const renderer = new RxnArrowRenderer(arrow);
    renderer.show();

    const arrowPath = canvas.querySelector('[data-testid="rxn-arrow"]');

    expect(arrowPath?.getAttribute('stroke')).toBe('#000');
  });
});
