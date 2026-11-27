import { keyNorm } from '../keynorm';

describe('keyNorm', () => {
  it('throws a TypeError for unsupported input types', () => {
    expect(() => keyNorm(123 as unknown as string)).toThrow(TypeError);
    expect(() => keyNorm(123 as unknown as string)).toThrow(
      'normalizeShortcut expects string or KeyboardEvent',
    );
  });
});
