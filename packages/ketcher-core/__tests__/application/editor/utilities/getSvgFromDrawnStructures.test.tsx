jest.mock('../../../../src/utilities/KetcherLogger', () => ({
  KetcherLogger: { error: jest.fn() },
}));

import { KetcherLogger } from '../../../../src/utilities/KetcherLogger';
import { getSvgFromDrawnStructures } from '../../../../src/utilities/getSvgFromDrawnStructures';

const SVG_NS = 'http://www.w3.org/2000/svg';

// helper to build a DOMRect-like object for getBoundingClientRect mocks
const makeRect = (
  x: number,
  y: number,
  width: number,
  height: number,
): DOMRect => {
  const left = x;
  const top = y;
  const right = left + width;
  const bottom = top + height;
  return {
    x,
    y,
    width,
    height,
    top,
    left,
    right,
    bottom,
    toJSON: () => ({ x, y, width, height, top, left, right, bottom }),
  } as unknown as DOMRect;
};

describe('getSvgFromDrawnStructures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns preview SVG and cleans up dynamic elements with numeric margin', () => {
    const canvas = document.createElementNS(
      SVG_NS,
      'svg',
    ) as unknown as SVGSVGElement;

    // Compose innerHTML with elements that should be removed/modified
    canvas.innerHTML = `
      <g class="drawn-structures">
        <rect id="rectangle-selection-area"></rect>
        <g class="dynamic-element"></g>
        <text>Label</text>
        <rect cursor="text"></rect>
        <g opacity="0.5"></g>
        <g style="cursor: pointer;"></g>
      </g>
    `;

    // mock getBoundingClientRect on the drawn-structures element
    const drawn = canvas.getElementsByClassName(
      'drawn-structures',
    )[0] as Element & { getBoundingClientRect?: () => any };
    drawn.getBoundingClientRect = () => makeRect(100, 200, 300, 400);
    // mock the canvas offset - the viewBox origin is relative to the canvas
    canvas.getBoundingClientRect = () => makeRect(10, 20, 800, 600);

    const result = getSvgFromDrawnStructures(canvas, 'preview', 5);
    expect(typeof result).toBe('string');

    // Expected viewBox calculations relative to the canvas offset (10, 20)
    // viewBoxX = 100 - 10 - 5 = 85
    // viewBoxY = 200 - 20 - 5 = 175
    // width = 300 + 5*2 = 310
    // height = 400 + 5*2 = 410
    expect(result).toContain("width='100%'");
    expect(result).toContain("height='100%'");
    expect(result).toContain("viewBox='85 175 310 410'");

    // rectangle-selection-area and dynamic-element should be removed
    expect(result).not.toContain('rectangle-selection-area');
    expect(result).not.toContain('dynamic-element');

    // text elements should have cursor default
    expect(result).toContain('cursor="default"');

    // rect with cursor="text" should have attribute removed
    expect(result).not.toContain('cursor="text"');

    // inline style 'cursor: pointer;' must be removed
    expect(result).not.toContain('cursor: pointer;');
  });

  test('returns file SVG with numeric margin and includes xmlns', () => {
    const canvas = document.createElementNS(
      SVG_NS,
      'svg',
    ) as unknown as SVGSVGElement;

    canvas.innerHTML = `
      <g class="drawn-structures">
        <text>Another</text>
      </g>
    `;

    const drawn = canvas.getElementsByClassName(
      'drawn-structures',
    )[0] as Element & { getBoundingClientRect?: () => any };
    drawn.getBoundingClientRect = () => makeRect(100, 200, 300, 400);
    canvas.getBoundingClientRect = () => makeRect(10, 20, 800, 600);

    const result = getSvgFromDrawnStructures(canvas, 'file', 2);
    expect(typeof result).toBe('string');

    // viewBox is relative to the canvas offset (10, 20) with margin 2
    // viewBoxX = 100 - 10 - 2 = 88
    // viewBoxY = 200 - 20 - 2 = 178
    // width = 300 + 2*2 = 304
    // height = 400 + 2*2 = 404
    expect(result).toContain("viewBox='88 178 304 404'");

    // width/height attributes in file output should be numeric
    expect(result).toContain("width='304'");
    expect(result).toContain("height='404'");

    // xmlns must be present for file export
    expect(result).toContain("xmlns='http://www.w3.org/2000/svg'");
  });

  test('logs error and returns undefined when drawn-structures missing or innerHTML empty', () => {
    const canvas = document.createElementNS(
      SVG_NS,
      'svg',
    ) as unknown as SVGSVGElement;

    // Canvas has empty innerHTML and no drawn-structures
    canvas.innerHTML = '';

    const result = getSvgFromDrawnStructures(canvas, 'file');
    expect(result).toBeUndefined();
    expect((KetcherLogger as any).error).toHaveBeenCalledWith(
      'Cannot get drawn structures!',
    );
  });

  test('returns minimal empty svg for unknown type', () => {
    const canvas = document.createElementNS(
      SVG_NS,
      'svg',
    ) as unknown as SVGSVGElement;
    canvas.innerHTML = `<g class="drawn-structures"><text>t</text></g>`;
    const drawn = canvas.getElementsByClassName(
      'drawn-structures',
    )[0] as Element & { getBoundingClientRect?: () => any };
    drawn.getBoundingClientRect = () => makeRect(0, 0, 1, 1);

    // call with unknown type string casted to any
    const result = getSvgFromDrawnStructures(canvas, 'unknown' as any);
    expect(result).toBe("<svg xmlns='http://www.w3.org/2000/svg' />");
  });
});
