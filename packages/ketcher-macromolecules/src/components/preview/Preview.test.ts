import { calculatePreviewPosition } from './Preview';

const commonParams = {
  targetTop: 400,
  targetBottom: 440,
  targetLeft: 500,
  targetWidth: 40,
  previewHeight: 200,
  previewWidth: 300,
  canvasWrapperTop: 150,
  canvasWrapperBottom: 750,
  canvasWrapperLeft: 200,
  canvasWrapperRight: 1000,
  ketcherRootOffsetX: 100,
  ketcherRootOffsetY: 50,
  previewOffset: 5,
};

describe('calculatePreviewPosition', () => {
  it('converts viewport coordinates to popup-root coordinates', () => {
    expect(calculatePreviewPosition(commonParams)).toEqual({
      top: 145,
      left: 270,
    });
  });

  it('keeps a preview inside the left canvas edge', () => {
    expect(
      calculatePreviewPosition({
        ...commonParams,
        targetLeft: 210,
      }).left,
    ).toBe(100);
  });

  it('keeps a preview inside the right canvas edge', () => {
    expect(
      calculatePreviewPosition({
        ...commonParams,
        targetLeft: 970,
      }).left,
    ).toBe(590);
  });

  it('places a preview below a target near the top edge', () => {
    expect(
      calculatePreviewPosition({
        ...commonParams,
        targetTop: 170,
        targetBottom: 210,
      }).top,
    ).toBe(165);
  });

  it('places a preview above a target near the bottom edge', () => {
    expect(
      calculatePreviewPosition({
        ...commonParams,
        targetTop: 700,
        targetBottom: 740,
      }).top,
    ).toBe(445);
  });
});
