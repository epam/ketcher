import {
  countTextLines,
  getMultilineTopAnchorOffset,
} from 'application/render/restruct/retext.utils';

describe('countTextLines', () => {
  it('returns 1 for a single line', () => {
    expect(countTextLines('a')).toBe(1);
  });

  it('returns 2 for two lines', () => {
    expect(countTextLines('a\nb')).toBe(2);
  });

  it('returns 3 for three lines', () => {
    expect(countTextLines('a\nb\nc')).toBe(3);
  });

  it('returns 2 for a trailing newline', () => {
    expect(countTextLines('a\n')).toBe(2);
  });
});

describe('getMultilineTopAnchorOffset', () => {
  it('returns 0 for a single line', () => {
    expect(getMultilineTopAnchorOffset(20, 1)).toBe(0);
  });

  it('returns half the block minus one line for two lines', () => {
    expect(getMultilineTopAnchorOffset(40, 2)).toBe(10);
  });

  it('returns the expected offset for an 81-line block', () => {
    expect(getMultilineTopAnchorOffset(1748, 81)).toBeCloseTo(863.2, 1);
  });

  it('returns 0 for non-finite height', () => {
    expect(getMultilineTopAnchorOffset(NaN, 2)).toBe(0);
    expect(getMultilineTopAnchorOffset(Infinity, 2)).toBe(0);
  });
});
