import { getCopolymerLabel } from 'application/render/restruct/resgroup';

describe('getCopolymerLabel (#10457)', () => {
  it('labels a copolymer without a subtype as "co"', () => {
    expect(getCopolymerLabel()).toBe('co');
    expect(getCopolymerLabel(null)).toBe('co');
    expect(getCopolymerLabel('')).toBe('co');
  });

  it('shows the standard abbreviation of each subtype', () => {
    expect(getCopolymerLabel('ran')).toBe('ran');
    expect(getCopolymerLabel('blo')).toBe('blk');
    expect(getCopolymerLabel('alt')).toBe('alt');
  });

  it('shows an unknown subtype as it is', () => {
    expect(getCopolymerLabel('xyz')).toBe('xyz');
  });
});
