import { getNewSelectedItems } from './select.helpers';

jest.mock(
  'ketcher-core',
  () => ({
    SGroup: {
      getAtoms: jest.fn(() => [1, 2]),
      getBonds: jest.fn(() => [3]),
    },
  }),
  { virtual: true },
);

describe('select helpers', () => {
  describe('getNewSelectedItems', () => {
    it('includes atoms and bonds from selected superatoms without labels', () => {
      const sgroup = {
        isSuperatomWithoutLabel: true,
      };
      const struct = {};
      const editor = {
        render: {
          ctab: {
            sgroups: new Map([[4, { item: sgroup }]]),
          },
        },
        struct: () => struct,
      };

      expect(getNewSelectedItems(editor as never, [4])).toEqual({
        atoms: [1, 2],
        bonds: [3],
      });
    });
  });
});
