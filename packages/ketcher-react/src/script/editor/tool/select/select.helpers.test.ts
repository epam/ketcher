import { getNewSelectedItems } from './select.helpers';

jest.mock(
  'ketcher-core',
  () => ({
    SGroup: {
      getAtoms: jest.fn((_, sgroup) => sgroup.atoms),
      getBonds: jest.fn((_, sgroup) => sgroup.bonds),
    },
  }),
  { virtual: true },
);

const getSGroupMock = () => jest.requireMock('ketcher-core').SGroup;

describe('select helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNewSelectedItems', () => {
    it('includes atoms and bonds from selected superatoms without labels', () => {
      const sgroup = {
        isSuperatomWithoutLabel: true,
        atoms: [1, 2],
        bonds: [3],
      };
      const struct = {
        atoms: new Map([
          [1, {}],
          [2, {}],
          [5, {}],
        ]),
        bonds: new Map([
          [3, { begin: 1, end: 2 }],
          [4, { begin: 2, end: 5 }],
        ]),
      };
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

    it('combines atoms and bonds from selected monomer and labeled S-groups', () => {
      const firstSgroup = {
        isSuperatomWithoutLabel: true,
        atoms: [1, 2],
        bonds: [3],
      };
      const secondSgroup = {
        isSuperatomWithoutLabel: false,
        atoms: [5, 6],
        bonds: [7],
      };
      const struct = {
        atoms: new Map([
          [1, {}],
          [2, {}],
          [5, {}],
          [6, {}],
        ]),
        bonds: new Map([
          [3, { begin: 1, end: 2 }],
          [7, { begin: 5, end: 6 }],
        ]),
      };
      const editor = {
        render: {
          ctab: {
            sgroups: new Map([
              [4, { item: firstSgroup }],
              [8, { item: secondSgroup }],
            ]),
          },
        },
        struct: () => struct,
      };

      expect(getNewSelectedItems(editor as never, [4, 8])).toEqual({
        atoms: [1, 2, 5, 6],
        bonds: [3, 7],
      });
    });

    it('returns empty atoms and bonds when no S-groups are selected', () => {
      const editor = {
        render: {
          ctab: {
            sgroups: new Map(),
          },
        },
        struct: () => ({
          atoms: new Map(),
          bonds: new Map(),
        }),
      };

      expect(getNewSelectedItems(editor as never, [])).toEqual({
        atoms: [],
        bonds: [],
      });
      expect(getSGroupMock().getAtoms).not.toHaveBeenCalled();
      expect(getSGroupMock().getBonds).not.toHaveBeenCalled();
    });
  });
});
