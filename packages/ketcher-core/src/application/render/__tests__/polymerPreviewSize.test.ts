import {
  getFontSizeInUnits,
  getPolymerPreviewSvgSize,
  MICRO_LABEL_FONT_PX,
} from '../polymerPreviewSize';

describe('getFontSizeInUnits', () => {
  it('gives a font that is drawn at the requested px size', () => {
    const units = getFontSizeInUnits(MICRO_LABEL_FONT_PX, 100, 45);
    expect(units * (45 / 100)).toBeCloseTo(MICRO_LABEL_FONT_PX);
  });

  it('keeps the on-screen size at any px per angstrom', () => {
    const units = getFontSizeInUnits(MICRO_LABEL_FONT_PX, 100, 80);
    expect(units * (80 / 100)).toBeCloseTo(MICRO_LABEL_FONT_PX);
  });

  it('uses the Ketcher default 10pt label font', () => {
    expect(MICRO_LABEL_FONT_PX).toBeCloseTo(13.33, 2);
  });
});

describe('getPolymerPreviewSvgSize', () => {
  const wrapper = { width: 300, height: 200 };
  // 100 canvas units per angstrom drawn at 40px per angstrom => 0.4 px per unit
  const scale = { unitsPerAngstrom: 100, pxPerAngstrom: 40 };

  it('keeps the canvas bond length: svg side is the content size scaled to px', () => {
    // content (labels included) is 200 x 100 units => 80 x 40 px
    expect(
      getPolymerPreviewSvgSize({
        contentSizeInUnits: { x: 200, y: 100 },
        ...scale,
        wrapper,
      }),
    ).toBe(80);
  });

  it('is not driven by the bond bounding box: label-dominated content gets room for its labels', () => {
    // a single short bond (100 units) with wide labels (200 units overall)
    // must not be squeezed into the 40px that the bond alone would give
    const size = getPolymerPreviewSvgSize({
      contentSizeInUnits: { x: 200, y: 60 },
      ...scale,
      wrapper,
    });
    expect(size).toBeGreaterThan(40);
  });

  it('returns undefined (fit to wrapper) when the content is wider than the wrapper', () => {
    expect(
      getPolymerPreviewSvgSize({
        contentSizeInUnits: { x: 1000, y: 100 },
        ...scale,
        wrapper,
      }),
    ).toBeUndefined();
  });

  it('returns undefined (fit to wrapper) when the content is taller than the wrapper', () => {
    expect(
      getPolymerPreviewSvgSize({
        contentSizeInUnits: { x: 100, y: 600 },
        ...scale,
        wrapper,
      }),
    ).toBeUndefined();
  });

  it('never exceeds the smaller wrapper side', () => {
    // 280 x 100 px content fits the 300 x 200 wrapper, but the svg is square
    expect(
      getPolymerPreviewSvgSize({
        contentSizeInUnits: { x: 700, y: 250 },
        ...scale,
        wrapper,
      }),
    ).toBe(200);
  });

  it('returns undefined for empty content', () => {
    expect(
      getPolymerPreviewSvgSize({
        contentSizeInUnits: { x: 0, y: 0 },
        ...scale,
        wrapper,
      }),
    ).toBeUndefined();
  });

  it('scales with the canvas bond length', () => {
    expect(
      getPolymerPreviewSvgSize({
        contentSizeInUnits: { x: 100, y: 100 },
        unitsPerAngstrom: 100,
        pxPerAngstrom: 80,
        wrapper,
      }),
    ).toBe(80);
  });
});
