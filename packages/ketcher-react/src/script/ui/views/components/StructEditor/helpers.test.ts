import { calculateMiddleCoordsForRect } from './helpers';

describe('calculateMiddleCoordsForRect', () => {
  it('returns the middle of each side of a closed rectangle path', () => {
    const rectangle = [
      [10, 10],
      [10, 20],
      [30, 20],
      [30, 10],
      [10, 10],
    ];

    expect(calculateMiddleCoordsForRect(rectangle)).toEqual([
      { x: 10, y: 15 },
      { x: 20, y: 20 },
      { x: 30, y: 15 },
      { x: 20, y: 10 },
    ]);
  });

  // The hover outline of a selected s-group can be a removed Raphael element
  // with no path, which gives an empty list of points.
  it('returns no points for an empty path', () => {
    expect(calculateMiddleCoordsForRect([])).toEqual([]);
  });
});
