import { formatRGroupLabels } from '../rGroupLabels';

describe('formatRGroupLabels', () => {
  it.each([
    [0, ''],
    [1, 'R1'],
    [5, 'R1R3'],
    [1 << 31, 'R32'],
    [(1 << 31) | 1, 'R1R32'],
  ])('formats mask %s as %s', (mask, label) => {
    expect(formatRGroupLabels(mask)).toBe(label);
  });
});
