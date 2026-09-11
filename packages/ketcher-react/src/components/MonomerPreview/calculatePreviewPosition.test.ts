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

  it('preserves legacy bond positioning outside popup mode', () => {
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
