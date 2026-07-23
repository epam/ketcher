jest.mock('utilities', () => ({
  KetcherLogger: { error: jest.fn() },
}));

import { KetcherLogger } from 'utilities';
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

    const result = getSvgFromDrawnStructures(canvas, 'preview', 5);
    expect(typeof result).toBe('string');

    // Expected viewBox calculations using constants from implementation
    // viewBoxX = 100 - 50 - 5 = 45
    // viewBoxY = 200 - 54 - 5 = 141
    // width = 300 + 5*2 = 310
    // height = 400 + 5*2 = 410
    expect(result).toContain("width='100%'");
    expect(result).toContain("height='100%'");
    expect(result).toContain("viewBox='45 141 310 410'");

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

  test('returns file SVG with margins object and includes xmlns', () => {
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

    // Pass margins object - implementation adds DEFAULT_MARGIN to each component
    const result = getSvgFromDrawnStructures(canvas, 'file', {
      horizontal: 2,
      vertical: 3,
    });
    expect(typeof result).toBe('string');

    // For margins {2,3} implementation uses DEFAULT_MARGIN (10) + provided => horizontal=12 vertical=13
    // viewBoxX = 100 - 50 - 12 = 38
    // viewBoxY = 200 - 54 - 13 = 133
    // width = 300 + 12*2 = 324
    // height = 400 + 13*2 = 426
    expect(result).toContain("viewBox='38 133 324 426'");

    // width/height attributes in file output should be numeric
    expect(result).toContain("width='324'");
    expect(result).toContain("height='426'");

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
