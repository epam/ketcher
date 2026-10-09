import { createMonomerCreationWizardZoomCalculator } from './monomerCreationWizardZoom';

const VIEWPORT_WIDTH = 1800;
const VIEWPORT_HEIGHT = 1100;

// With microModeScale = 1 the model units are equal to pixels at 100% zoom,
// so the structure size can be given directly in pixels.
const getZoomForSize = (
  width: number,
  height: number,
  currentZoom = 1,
  calculate = createMonomerCreationWizardZoomCalculator(),
) =>
  calculate({
    structBoundingBox: { min: { x: 0, y: 0 }, max: { x: width, y: height } },
    microModeScale: 1,
    viewportWidth: VIEWPORT_WIDTH,
    viewportHeight: VIEWPORT_HEIGHT,
    currentZoom,
  });

describe('monomer creation wizard zoom calculator', () => {
  describe('when the zoom should stay as it is', () => {
    it('keeps the zoom when the structure fits and fills at least half of the viewport', () => {
      expect(getZoomForSize(1000, 300)).toBe(1);
    });

    it('keeps a zoom above 200% when the structure fits well at that zoom', () => {
      // 200x300 at 300% is 600x900 on the screen
      expect(getZoomForSize(200, 300, 3)).toBe(3);
    });
  });

  describe('when the structure is too small', () => {
    it('zooms in using the candidate closer to 100%', () => {
      // half width needs 4.5, half height needs 1.83 -> 1.83 -> 1.8
      expect(getZoomForSize(200, 300)).toBe(1.8);
    });

    it('does not depend on the current zoom', () => {
      expect(getZoomForSize(200, 300, 0.3)).toBe(1.8);
    });

    it('does not zoom in above 200%', () => {
      expect(getZoomForSize(20, 20)).toBe(2);
    });
  });

  describe('when the structure is outside of the viewport', () => {
    it('zooms out using the candidate closer to 100%', () => {
      // half width needs 0.45, half height needs 0.69 -> 0.69 -> 0.7
      expect(getZoomForSize(2000, 800)).toBe(0.7);
    });

    it('zooms out a structure that fits at 100% but is outside at the current zoom', () => {
      // 200x300 at 400% is 800x1200, which is taller than the viewport
      expect(getZoomForSize(200, 300, 4)).toBe(1.8);
    });

    it('does not zoom out below 50%', () => {
      expect(getZoomForSize(10000, 8000)).toBe(0.5);
    });
  });

  describe('rounding', () => {
    it('rounds to the nearest 10% up', () => {
      // half height needs 550 / 430 = 1.279 -> 1.3
      expect(getZoomForSize(100, 430)).toBe(1.3);
    });

    it('rounds to the nearest 10% down', () => {
      // half height needs 550 / 450 = 1.222 -> 1.2
      expect(getZoomForSize(100, 450)).toBe(1.2);
    });

    it('does not produce floating point errors', () => {
      // 550 / 305 = 1.803 -> 1.8, not 1.8000000000000003
      expect(getZoomForSize(100, 305)).toBe(1.8);
    });
  });

  describe('choosing between the horizontal and the vertical zoom', () => {
    it('prefers the vertical zoom when both are equally far from 100%', () => {
      // half width needs 1.5, half height needs 0.5: both are 0.5 away from 100%
      expect(getZoomForSize(600, 1100, 0.4)).toBe(0.5);
    });
  });

  describe('edge cases', () => {
    it('uses the horizontal zoom for a structure without height', () => {
      // 1000x0 at 200% is 2000 wide on the screen, which is outside
      expect(getZoomForSize(1000, 0, 2)).toBe(0.9);
    });

    it('uses the vertical zoom for a structure without width', () => {
      // 0x1000 at 200% is 2000 high on the screen, which is outside
      // half height needs 550 / 1000 = 0.55 -> 0.6
      expect(getZoomForSize(0, 1000, 2)).toBe(0.6);
    });

    it('zooms a single atom to the maximum zoom', () => {
      expect(getZoomForSize(0, 0)).toBe(2);
    });
  });

  describe('input handling', () => {
    it('converts model units to pixels with microModeScale', () => {
      const calculate = createMonomerCreationWizardZoomCalculator();

      // 5 x 7.5 model units * 40 = 200 x 300 pixels
      expect(
        calculate({
          structBoundingBox: {
            min: { x: 0, y: 0 },
            max: { x: 5, y: 7.5 },
          },
          microModeScale: 40,
          viewportWidth: VIEWPORT_WIDTH,
          viewportHeight: VIEWPORT_HEIGHT,
          currentZoom: 1,
        }),
      ).toBe(1.8);
    });

    it('uses only the size of the bounding box, not its position', () => {
      const calculate = createMonomerCreationWizardZoomCalculator();

      expect(
        calculate({
          structBoundingBox: {
            min: { x: 10, y: 20 },
            max: { x: 15, y: 27.5 },
          },
          microModeScale: 40,
          viewportWidth: VIEWPORT_WIDTH,
          viewportHeight: VIEWPORT_HEIGHT,
          currentZoom: 1,
        }),
      ).toBe(1.8);
    });
  });

  describe('configuration', () => {
    it('allows overriding the maximum zoom', () => {
      const calculate = createMonomerCreationWizardZoomCalculator({
        maxZoom: 3,
      });

      expect(getZoomForSize(20, 20, 1, calculate)).toBe(3);
    });

    it('allows overriding the minimum zoom', () => {
      const calculate = createMonomerCreationWizardZoomCalculator({
        minZoom: 0.2,
      });

      expect(getZoomForSize(10000, 8000, 1, calculate)).toBe(0.2);
    });
  });
});
