import { Pool } from 'domain/entities/pool';

describe('Pool.changeInitiallySelectedPropertiesForPool', () => {
  it.each([undefined, false, true])(
    'skips unsupported values and forwards invalidate=%s to supported values',
    (invalidate) => {
      const first = { resetInitiallySelected: jest.fn() };
      const second = { resetInitiallySelected: jest.fn() };
      const pool = new Pool<unknown>([
        [0, null],
        [1, first],
        [2, { resetInitiallySelected: true }],
        [3, second],
      ]);

      pool.changeInitiallySelectedPropertiesForPool(invalidate);

      expect(first.resetInitiallySelected).toHaveBeenCalledTimes(1);
      expect(first.resetInitiallySelected).toHaveBeenCalledWith(invalidate);
      expect(second.resetInitiallySelected).toHaveBeenCalledTimes(1);
      expect(second.resetInitiallySelected).toHaveBeenCalledWith(invalidate);
      expect([...pool.values()]).toEqual([
        null,
        first,
        { resetInitiallySelected: true },
        second,
      ]);
    },
  );
});
