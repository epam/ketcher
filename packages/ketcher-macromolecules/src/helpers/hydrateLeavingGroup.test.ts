import hydrateLeavingGroup from './hydrateLeavingGroup';

describe('hydrateLeavingGroup', () => {
  it('should hydrate O to OH', () => {
    expect(hydrateLeavingGroup('O')).toBe('OH');
  });

  it('should hydrate N to NH2', () => {
    expect(hydrateLeavingGroup('N')).toBe('NH2');
  });

  it('should fallback to H for empty value', () => {
    expect(hydrateLeavingGroup(undefined)).toBe('H');
    expect(hydrateLeavingGroup(null)).toBe('H');
  });
});
