import { fromStereoLabel } from './structconv';

describe('fromStereoLabel', () => {
  it('returns no type for a null label', () => {
    expect(fromStereoLabel(null)).toEqual({ type: null });
  });

  it.each(['', '123'])(
    'preserves label "%s" when there is no non-digit match',
    (label) => {
      expect(fromStereoLabel(label)).toEqual({
        type: label,
        orNumber: 0,
        andNumber: 0,
      });
    },
  );

  it.each([
    ['abs', { type: 'abs', orNumber: 1, andNumber: 1 }],
    ['&2', { type: '&', orNumber: 1, andNumber: 2 }],
    ['or3', { type: 'or', orNumber: 3, andNumber: 1 }],
    ['invalid', { type: null }],
  ])('converts stereo label "%s"', (label, expected) => {
    expect(fromStereoLabel(label)).toEqual(expected);
  });
});
