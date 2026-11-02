import { getOrThrow } from '../getOrThrow';

describe('getOrThrow', () => {
  it('returns the value when the key is present', () => {
    const map = new Map<string, number>([['a', 1]]);

    expect(getOrThrow(map, 'a', 'not found')).toBe(1);
  });

  it('throws with the given message when the key is missing', () => {
    const map = new Map<string, number>();

    expect(() => getOrThrow(map, 'missing', 'value missing')).toThrow(
      'value missing',
    );
  });

  it('returns falsy values without throwing', () => {
    const map = new Map<string, number>([['zero', 0]]);

    expect(getOrThrow(map, 'zero', 'not found')).toBe(0);
  });
});
