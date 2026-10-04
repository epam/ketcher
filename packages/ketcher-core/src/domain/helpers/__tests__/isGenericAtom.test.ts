import { isGenericAtom } from '../isGenericAtom';

describe('isGenericAtom', () => {
  it('returns false for a real element label', () => {
    expect(isGenericAtom('C')).toBe(false);
  });

  it('returns false for other real element labels', () => {
    expect(isGenericAtom('N')).toBe(false);
    expect(isGenericAtom('O')).toBe(false);
    expect(isGenericAtom('Fe')).toBe(false);
  });

  it('returns true for all 8 atom generic labels', () => {
    expect(isGenericAtom('A')).toBe(true);
    expect(isGenericAtom('AH')).toBe(true);
    expect(isGenericAtom('Q')).toBe(true);
    expect(isGenericAtom('QH')).toBe(true);
    expect(isGenericAtom('M')).toBe(true);
    expect(isGenericAtom('MH')).toBe(true);
    expect(isGenericAtom('X')).toBe(true);
    expect(isGenericAtom('XH')).toBe(true);
  });

  it('returns true for special node generics', () => {
    expect(isGenericAtom('*')).toBe(true);
    expect(isGenericAtom('R')).toBe(true);
  });

  it('returns true for group generic labels', () => {
    expect(isGenericAtom('G')).toBe(true);
    expect(isGenericAtom('GH')).toBe(true);
    expect(isGenericAtom('ALK')).toBe(true);
    expect(isGenericAtom('ARY')).toBe(true);
  });

  it('returns false for atom-list marker label L#', () => {
    // L# is a list marker, not a generic atom
    expect(isGenericAtom('L#')).toBe(false);
  });

  it('returns false for atom-list marker label L', () => {
    expect(isGenericAtom('L')).toBe(false);
  });
});
