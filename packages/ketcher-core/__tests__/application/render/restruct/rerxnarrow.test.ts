import { Render, ReStruct } from 'application/render';
import { getArrowPath } from 'application/render/draw';
import defaultOptions from 'application/render/options';
import { SELECTION_COLOR } from 'application/render/renderers/constants';
import type { RenderOptions } from 'application/render/render.types';
import ReRxnArrow from 'application/render/restruct/rerxnarrow';
import util from 'application/render/util';
import { Scale } from 'domain/helpers';
import { Struct, RxnArrowMode, Vec2 } from 'domain/entities';

const testOptions = defaultOptions({
  width: 200,
  height: 200,
  microModeScale: 100,
} as RenderOptions);

function createReRxnArrow(mode: RxnArrowMode, height = 0) {
  return new ReRxnArrow({
    mode,
    pos: [new Vec2(0, 0), new Vec2(10, 0)],
    height,
    arrowId: 1,
  });
}

describe('ReRxnArrow', () => {
  let render: Render;
  let restruct: ReStruct;

  beforeEach(() => {
    render = new Render(document as unknown as HTMLElement, testOptions);
    restruct = new ReStruct(new Struct(), render);
  });

  it('selection plate path matches getArrowPath geometry', () => {
    const reArrow = createReRxnArrow(RxnArrowMode.OpenAngle);
    const selectionPath = reArrow.generatePath(
      render,
      testOptions,
      'selection',
    );
    const pos = reArrow.item.pos.map((p) =>
      Scale.modelToCanvas(p, testOptions),
    );
    const { length, angle } = reArrow.getArrowParams(
      pos[0].x,
      pos[0].y,
      pos[1].x,
      pos[1].y,
    );
    const arrowPath = getArrowPath(
      { mode: reArrow.item.mode, pos, height: 0 },
      length,
      angle,
      testOptions,
    );
    expect(selectionPath).toBe(arrowPath);
  });

  it('selection plate uses arrowSelectionStyle', () => {
    const reArrow = createReRxnArrow(RxnArrowMode.FilledTriangle);
    const plate = reArrow.makeSelectionPlate(
      restruct,
      render.paper,
      testOptions,
    );
    const path = plate[0];
    expect(path.attr('stroke')).toBe(SELECTION_COLOR);
    expect(path.attr('fill')).toBe('none');
    expect(path.attr('stroke-linecap')).toBe('round');
  });

  it('makeAdditionalInfo renders white selection handles', () => {
    const reArrow = createReRxnArrow(RxnArrowMode.OpenAngle);
    const handles = reArrow.makeAdditionalInfo(restruct);
    handles.forEach((handle) => {
      expect(handle.attr('fill')).toBe('#FFFFFF');
    });
  });

  describe('calcDistance for elliptical arrows', () => {
    const reArrow = createReRxnArrow(RxnArrowMode.EllipticalArcOpenAngle, 2);

    it('detects point on arc', () => {
      const apex = util.findMiddlePoint(
        2,
        reArrow.item.pos[0],
        reArrow.item.pos[1],
      );
      const { minDist } = reArrow.calcDistance(apex, 1);
      expect(minDist).toBeLessThan(0.3);
    });

    it('does not detect chord midpoint', () => {
      const chordMid = Vec2.centre(reArrow.item.pos[0], reArrow.item.pos[1]);
      const { minDist } = reArrow.calcDistance(chordMid, 1);
      expect(minDist).toBeGreaterThan(1);
    });
  });
});

describe('getArrowPath parity', () => {
  it('selection path equals getArrowPath for elliptical mode', () => {
    const item = {
      mode: RxnArrowMode.EllipticalArcFilledBow,
      pos: [new Vec2(10, 50), new Vec2(110, 50)],
      height: 20,
    };
    const path = getArrowPath(item, 100, 0, testOptions);
    expect(path).toContain('A');
  });
});
