import { isIdtAliasLengthValid } from 'utilities';

describe('isIdtAliasLengthValid', () => {
  it.each([
    ['', true],
    ['ABCDE12345', true],
    ['ABCDE123456', false],
    ['/modif/', true],
    ['/modif', false],
    ['modif/', false],
    ['/ABCDE123456/', true],
  ])('returns %p as %p', (alias: string, expected: boolean) => {
    expect(isIdtAliasLengthValid(alias)).toBe(expected);
  });
});
