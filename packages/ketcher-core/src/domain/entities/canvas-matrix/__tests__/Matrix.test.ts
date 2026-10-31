import { Matrix } from '../Matrix';

describe('Matrix iteration', () => {
  it('iterates populated cells in the same order as each traversal', () => {
    const matrix = new Matrix<string>();
    matrix.set(0, 0, 'a');
    matrix.set(0, 2, 'c');
    matrix.set(1, 1, 'd');

    expect(Array.from(matrix)).toEqual(['a', 'c', 'd']);
    expect(Array.from(matrix.valuesRightToLeft())).toEqual(['d', 'c', 'a']);
    expect(Array.from(matrix.valuesBottomToTop())).toEqual(['c', 'd', 'a']);
  });
});
