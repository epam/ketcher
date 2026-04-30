import { toSubscript } from './useAttachmentPointSelectsData';

describe('toSubscript', () => {
  it.each<{ input: number; expected: string }>([
    { input: 0, expected: '₀' },
    { input: 1, expected: '₁' },
    { input: 2, expected: '₂' },
    { input: 3, expected: '₃' },
    { input: 4, expected: '₄' },
    { input: 5, expected: '₅' },
    { input: 6, expected: '₆' },
    { input: 7, expected: '₇' },
    { input: 8, expected: '₈' },
    { input: 9, expected: '₉' },
  ])('maps single digit $input to $expected', ({ input, expected }) => {
    expect(toSubscript(input)).toBe(expected);
  });

  it('maps multi-digit numbers digit-by-digit', () => {
    expect(toSubscript(10)).toBe('₁₀');
    expect(toSubscript(123)).toBe('₁₂₃');
  });
});
