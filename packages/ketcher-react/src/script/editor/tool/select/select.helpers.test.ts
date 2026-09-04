import { Bond } from 'ketcher-core';
import {
  canOpenAtomProperties,
  getMovableAtomIdsForBond,
  getNewSelectedItems,
} from './select.helpers';

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
    });
  });

  describe('getMovableAtomIdsForBond', () => {
    it('keeps the Attachment Group fixed when it is the bond begin', () => {
      const struct = {
        atoms: new Map([[1, { label: 'Fe' }]]),
        attachmentGroups: new Map([[0, { atomIds: [2, 3] }]]),
        bonds: new Map([
          [0, { type: Bond.PATTERN.TYPE.HAPTIC, begin: 0, end: 1 }],
        ]),
      };

      expect(getMovableAtomIdsForBond(struct as never, 0, [0, 1])).toEqual([1]);
    });

    it('keeps the Attachment Group fixed when it is the bond end', () => {
      const struct = {
        atoms: new Map([[0, { label: 'Fe' }]]),
        attachmentGroups: new Map([[1, { atomIds: [2, 3] }]]),
        bonds: new Map([
          [0, { type: Bond.PATTERN.TYPE.HAPTIC, begin: 0, end: 1 }],
        ]),
      };

      expect(getMovableAtomIdsForBond(struct as never, 0, [0, 1])).toEqual([0]);
    });

    it('keeps all movable atoms for a bond without an Attachment Group', () => {
      const struct = {
        atoms: new Map([
          [0, { label: 'C' }],
          [1, { label: 'Fe' }],
        ]),
        attachmentGroups: new Map(),
        bonds: new Map([
          [0, { type: Bond.PATTERN.TYPE.HAPTIC, begin: 0, end: 1 }],
        ]),
      };

      expect(getMovableAtomIdsForBond(struct as never, 0, [0, 1])).toEqual([
        0, 1,
      ]);
    });
  });

  describe('canOpenAtomProperties', () => {
    it('does not allow atom properties for an Attachment Group', () => {
      const struct = {
        atoms: new Map(),
        attachmentGroups: new Map([[0, { atomIds: [1, 2] }]]),
      };

      expect(canOpenAtomProperties(struct as never, 0)).toBe(false);
    });

    it('allows atom properties for a regular atom', () => {
      const struct = {
        atoms: new Map([[0, { label: 'C' }]]),
        attachmentGroups: new Map(),
      };

      expect(canOpenAtomProperties(struct as never, 0)).toBe(true);
    });
  });
});
