import { Matrix } from '../Matrix';

describe('Matrix', () => {
  it('distinguishes missing rows from rows containing falsy values', () => {
    const matrix = new Matrix<number>();

    expect(matrix.get(0, 0)).toBeUndefined();
    matrix.set(0, 0, 0);
    matrix.set(0, 1, 1);
    expect(matrix.get(0, 0)).toBe(0);
    expect(matrix.get(0, 1)).toBe(1);
    expect(matrix.get(1, 0)).toBeUndefined();
  });
});
