import { Render } from 'application/render';
import draw, {
  FILLED_ARROW_MODES,
  getArrowPath,
  getSelectionHandleRadius,
} from 'application/render/draw';
import defaultOptions from 'application/render/options';
import { SELECTION_HANDLE_FILL_COLOR } from 'application/render/renderers/constants';
import type { RenderOptions } from 'application/render/render.types';
import { RxnArrowMode } from 'domain/entities/rxnArrow';
import { Vec2 } from 'domain/entities/vec2';

const testOptions = defaultOptions({
  width: 200,
  height: 200,
  microModeScale: 100,
} as RenderOptions);

const arrowModes = Object.values(RxnArrowMode);

function makeArrowItem(mode: RxnArrowMode) {
  const isElliptical = [
    RxnArrowMode.EllipticalArcFilledBow,
    RxnArrowMode.EllipticalArcFilledTriangle,
    RxnArrowMode.EllipticalArcOpenAngle,
    RxnArrowMode.EllipticalArcOpenHalfAngle,
  ].includes(mode);

  return {
    mode,
    pos: [new Vec2(10, 50), new Vec2(110, 50)],
    height: isElliptical ? 20 : 0,
  };
}

describe('draw arrow paths', () => {
  it.each(arrowModes)('getArrowPath snapshot for %s', (mode) => {
    const item = makeArrowItem(mode);
    const path = getArrowPath(item, 100, 0, testOptions);
    expect(path).toMatchSnapshot();
  });

  it('FILLED_ARROW_MODES covers exactly 10 filled modes', () => {
    expect(FILLED_ARROW_MODES.size).toBe(10);
  });

  it('arrow() applies fill for filled modes only', () => {
    const render = new Render(document as unknown as HTMLElement, testOptions);
    const filled = draw.arrow(
      render.paper,
      makeArrowItem(RxnArrowMode.FilledTriangle),
      100,
      0,
      testOptions,
      false,
    );
    const open = draw.arrow(
      render.paper,
      makeArrowItem(RxnArrowMode.OpenAngle),
      100,
      0,
      testOptions,
      false,
    );
    const elliptical = draw.arrow(
      render.paper,
      makeArrowItem(RxnArrowMode.EllipticalArcOpenAngle),
      100,
      0,
      testOptions,
      false,
    );

    expect(filled.attr('fill')).toBe('#000');
    expect(open.attr('fill')).not.toBe('#000');
    expect(elliptical.attr('fill')).not.toBe('#000');
  });

  it('selectionHandle uses white fill and scaled radius', () => {
    const render = new Render(document as unknown as HTMLElement, testOptions);
    const handle = draw.selectionHandle(
      render.paper,
      new Vec2(50, 50),
      testOptions,
    );

    expect(handle.attr('fill')).toBe(SELECTION_HANDLE_FILL_COLOR);
    expect(handle.attr('r')).toBe(getSelectionHandleRadius(testOptions));
  });
});
