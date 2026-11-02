import { ZoomTransform } from 'd3';
import ZoomTool from 'application/editor/tools/Zoom';
import { getSearchFunction } from 'domain/helpers/attachmentPointCalculations';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

// The monomer is a box of 60x40 around (100, 100) on the canvas.
const CENTER = { x: 100, y: 100 };
const HALF_WIDTH = 30;
const HALF_HEIGHT = 20;

const bodyNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
const monomer = {
  renderer: { bodyElement: { node: () => bodyNode } },
} as unknown as BaseMonomer;

// jsdom has no elementsFromPoint. The box is given on the screen: the canvas
// box moved by the zoom transform and the offset of the canvas.
function installHitTest(zoom = { k: 1, x: 0, y: 0 }, offset = { x: 0, y: 0 }) {
  const left = zoom.k * (CENTER.x - HALF_WIDTH) + zoom.x + offset.x;
  const right = zoom.k * (CENTER.x + HALF_WIDTH) + zoom.x + offset.x;
  const top = zoom.k * (CENTER.y - HALF_HEIGHT) + zoom.y + offset.y;
  const bottom = zoom.k * (CENTER.y + HALF_HEIGHT) + zoom.y + offset.y;

  const hitTest = jest.fn((x: number, y: number) =>
    x >= left && x <= right && y >= top && y <= bottom ? [bodyNode] : [],
  );
  Object.defineProperty(document, 'elementsFromPoint', {
    configurable: true,
    writable: true,
    value: hitTest,
  });

  return hitTest;
}

describe('getSearchFunction', () => {
  ZoomTool.initInstance(new DrawingEntitiesManager());

  afterEach(() => {
    Reflect.deleteProperty(document, 'elementsFromPoint');
    ZoomTool.instance.setZoomTransform(new ZoomTransform(1, 0, 0));
  });

  describe('without zoom', () => {
    it('finds the right border of the monomer when searching to the right', () => {
      installHitTest();
      const findPointOnMonomerBorder = getSearchFunction(
        0,
        { x: 0, y: 0 },
        monomer,
      );

      const point = findPointOnMonomerBorder(CENTER, 50, false);

      // the search stops within 1 pixel of the border
      expect(Math.abs(point.x - (CENTER.x + HALF_WIDTH))).toBeLessThan(1.5);
      expect(point.y).toBeCloseTo(CENTER.y, 5);
    });

    it('finds the top border of the monomer when searching up', () => {
      installHitTest();
      const findPointOnMonomerBorder = getSearchFunction(
        -90,
        { x: 0, y: 0 },
        monomer,
      );

      const point = findPointOnMonomerBorder(CENTER, 50, false);

      expect(Math.abs(point.y - (CENTER.y - HALF_HEIGHT))).toBeLessThan(1.5);
      expect(point.x).toBeCloseTo(CENTER.x, 5);
    });

    it('hands the point of the first step plus the canvas offset to the hit test', () => {
      const hitTest = installHitTest(undefined, { x: 5, y: 7 });
      const findPointOnMonomerBorder = getSearchFunction(
        0,
        { x: 5, y: 7 },
        monomer,
      );

      const point = findPointOnMonomerBorder(CENTER, 50, false);

      // first step: 50 to the right of the center
      expect(hitTest.mock.calls[0]).toEqual([155, 107]);
      expect(Math.abs(point.x - (CENTER.x + HALF_WIDTH))).toBeLessThan(1.5);
    });

    it('returns the point of the first step when it is closer than one pixel', () => {
      const hitTest = installHitTest();
      const findPointOnMonomerBorder = getSearchFunction(
        0,
        { x: 0, y: 0 },
        monomer,
      );

      const point = findPointOnMonomerBorder(CENTER, 1, false);

      expect(point.x).toBeCloseTo(CENTER.x + 1, 5);
      expect(point.y).toBeCloseTo(CENTER.y, 5);
      expect(hitTest).not.toHaveBeenCalled();
    });
  });

  describe('with zoom', () => {
    it('hands the point converted to the view to the hit test', () => {
      const zoom = { k: 2, x: 10, y: 20 };
      ZoomTool.instance.setZoomTransform(
        new ZoomTransform(zoom.k, zoom.x, zoom.y),
      );
      const hitTest = installHitTest(zoom);
      const findPointOnMonomerBorder = getSearchFunction(
        0,
        { x: 0, y: 0 },
        monomer,
      );

      findPointOnMonomerBorder(CENTER, 50, true);

      // first step: (150, 100) on the canvas is (2 * 150 + 10, 2 * 100 + 20) in the view
      expect(hitTest.mock.calls[0]).toEqual([310, 220]);
    });

    it('finds the same border point on the canvas as without zoom', () => {
      const zoom = { k: 2, x: 10, y: 20 };
      ZoomTool.instance.setZoomTransform(
        new ZoomTransform(zoom.k, zoom.x, zoom.y),
      );
      installHitTest(zoom);
      const findPointOnMonomerBorder = getSearchFunction(
        0,
        { x: 0, y: 0 },
        monomer,
      );

      const point = findPointOnMonomerBorder(CENTER, 50, true);

      expect(Math.abs(point.x - (CENTER.x + HALF_WIDTH))).toBeLessThan(1.5);
      expect(point.y).toBeCloseTo(CENTER.y, 5);
    });

    it('does not convert the point when zoom is not requested, even if the canvas is zoomed', () => {
      ZoomTool.instance.setZoomTransform(new ZoomTransform(2, 10, 20));
      const hitTest = installHitTest();
      const findPointOnMonomerBorder = getSearchFunction(
        0,
        { x: 0, y: 0 },
        monomer,
      );

      findPointOnMonomerBorder(CENTER, 50, false);

      expect(hitTest.mock.calls[0]).toEqual([150, 100]);
    });
  });
});
