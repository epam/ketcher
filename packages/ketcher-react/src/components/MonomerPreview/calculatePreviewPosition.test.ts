import { calculateBondPreviewPositionByCoordinates } from './calculatePreviewPosition';

const canvas = { left: 200, top: 150, right: 1000, bottom: 750 };
const popupRoot = { left: 100, top: 50, right: 1100, bottom: 850 };

describe('calculateBondPreviewPositionByCoordinates', () => {
  it('converts viewport coordinates to popup-root coordinates', () => {
    expect(
      calculateBondPreviewPositionByCoordinates(
        { left: 500, top: 500, right: 700, bottom: 520 },
        canvas,
        popupRoot,
      ),
    ).toEqual({
      top: '177px',
      left: '500px',
      transform: 'translate(-50%, 0)',
    });
  });

  it('places a horizontal bond preview below when there is no room above', () => {
    expect(
      calculateBondPreviewPositionByCoordinates(
        { left: 500, top: 170, right: 700, bottom: 190 },
        canvas,
        popupRoot,
      ),
    ).toEqual({
      top: '145px',
      left: '500px',
      transform: 'translate(-50%, 0)',
    });
  });

  it('keeps a horizontal bond preview inside the right canvas edge', () => {
    expect(
      calculateBondPreviewPositionByCoordinates(
        { left: 920, top: 500, right: 980, bottom: 520 },
        canvas,
        popupRoot,
      ).transform,
    ).toBe('translate(-100%, 0)');
  });

  it('places a vertical bond preview to the right when there is no room on the left', () => {
    expect(
      calculateBondPreviewPositionByCoordinates(
        { left: 220, top: 300, right: 240, bottom: 600 },
        canvas,
        popupRoot,
      ),
    ).toEqual({
      top: '400px',
      left: '324px',
      transform: 'translate(-50%, -50%)',
    });
  });

  it('keeps a vertical bond preview inside the bottom canvas edge', () => {
    expect(
      calculateBondPreviewPositionByCoordinates(
        { left: 700, top: 680, right: 720, bottom: 740 },
        canvas,
        popupRoot,
      ).transform,
    ).toBe('translate(-50%, -100%)');
  });

  it('uses the side with more space when a vertical preview fits neither side', () => {
    expect(
      calculateBondPreviewPositionByCoordinates(
        { left: 650, top: 300, right: 670, bottom: 600 },
        canvas,
        popupRoot,
      ).left,
    ).toBe('366px');
  });

  it('uses popup boundaries to choose a side for a vertical preview', () => {
    expect(
      calculateBondPreviewPositionByCoordinates(
        { left: 400, top: 300, right: 420, bottom: 600 },
        { left: 300, top: 150, right: 700, bottom: 750 },
        popupRoot,
      ).left,
    ).toBe('504px');
  });

  it('positions a bond preview without popup offsets', () => {
    expect(
      calculateBondPreviewPositionByCoordinates(
        { left: 500, top: 500, right: 700, bottom: 520 },
        canvas,
      ),
    ).toEqual({
      top: '227px',
      left: '600px',
      transform: 'translate(-50%, 0)',
    });
  });
});

it('keeps the full preview inside a popup when neither side has room', () => {
  const style = calculateBondPreviewPositionByCoordinates(
    { left: 420, top: 250, right: 440, bottom: 550 },
    { left: 150, top: 150, right: 750, bottom: 700 },
    { left: 100, top: 50, right: 780, bottom: 730 },
  );
  const viewportLeft = Number.parseFloat(style.left!) + 100 - 358 / 2;
  expect(viewportLeft).toBeGreaterThanOrEqual(100);
  expect(viewportLeft + 358).toBeLessThanOrEqual(780);
});
it('uses available space below a bond with a root at the viewport origin', () => {
  const style = calculateBondPreviewPositionByCoordinates(
    { left: 400, top: 250, right: 600, bottom: 270 },
    { left: 40, top: 100, right: 700, bottom: 750 },
    { left: 0, top: 0, right: 1000, bottom: 800 },
  );
  expect(style.top).toBe('275px');
});

it.each([
  { left: 160, top: 160, right: 300, bottom: 190 },
  { left: 600, top: 660, right: 740, bottom: 690 },
  { left: 420, top: 250, right: 440, bottom: 550 },
  { left: 200, top: 380, right: 700, bottom: 420 },
])('keeps the rendered bond preview in bounds for %o', (bond) => {
  const bounds = { left: 100, top: 150, right: 780, bottom: 700 };
  const style = calculateBondPreviewPositionByCoordinates(bond, bounds, bounds);
  const translation = style.transform?.match(/-?\d+/g)?.map(Number) ?? [];
  expect(translation).toHaveLength(2);
  const left =
    Number.parseFloat(style.left ?? '') +
    bounds.left +
    (translation[0] / 100) * 358;
  const top =
    Number.parseFloat(style.top ?? '') +
    bounds.top +
    (translation[1] / 100) * 268;
  expect(left).toBeGreaterThanOrEqual(bounds.left);
  expect(left + 358).toBeLessThanOrEqual(bounds.right);
  expect(top).toBeGreaterThanOrEqual(bounds.top);
  expect(top + 268).toBeLessThanOrEqual(bounds.bottom);
});
