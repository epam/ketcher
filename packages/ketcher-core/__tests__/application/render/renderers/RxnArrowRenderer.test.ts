import { RxnArrowRenderer } from 'application/render/renderers/RxnArrowRenderer';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { RxnArrowMode, Vec2 } from 'domain/entities';
import { createPolymerEditorCanvas } from '../../../helpers/dom';

describe('RxnArrowRenderer', () => {
  let canvas: SVGSVGElement;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
  });

  afterEach(() => {
    canvas.remove();
  });

  it('renders endpoint handles for selected arrows', () => {
    const arrow = new RxnArrow(RxnArrowMode.OpenAngle, [
      new Vec2(0, 0),
      new Vec2(1, 0),
    ]);
    const renderer = new RxnArrowRenderer(arrow);

    arrow.turnOnSelection();
    renderer.show();

    expect(
      canvas.querySelectorAll('g.dynamic-element circle[fill="#000"]'),
    ).toHaveLength(2);
    expect(
      canvas.querySelectorAll('path.dynamic-element[fill="#57ff8f"]'),
    ).toHaveLength(1);
  });

  it('does not leave stale selection overlays after redraw', () => {
    const arrow = new RxnArrow(RxnArrowMode.OpenAngle, [
      new Vec2(0, 0),
      new Vec2(1, 0),
    ]);
    const renderer = new RxnArrowRenderer(arrow);

    arrow.turnOnSelection();
    renderer.show();
    renderer.drawSelection();

    expect(
      canvas.querySelectorAll('path.dynamic-element[fill="#57ff8f"]'),
    ).toHaveLength(1);
    expect(
      canvas.querySelectorAll('g.dynamic-element circle[fill="#000"]'),
    ).toHaveLength(2);
  });
});
