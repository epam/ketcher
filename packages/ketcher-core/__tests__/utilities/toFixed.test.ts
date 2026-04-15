import { toFixed } from 'utilities';

describe('toFixed', () => {
  it.each([
    [1.234567891, '1.23456789'],
    ['1.2', '1.20000000'],
    ['1.234567895', '1.23456790'],
    ['not a number', 'NaN'],
  ])('returns %p as %p', (value, expected) => {
    expect(toFixed(value)).toBe(expected);
  });
});
