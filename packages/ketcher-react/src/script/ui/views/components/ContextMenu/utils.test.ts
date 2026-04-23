import { MULTITAIL_ARROW_KEY } from 'ketcher-core';
import {
  getShouldResetSelection,
  getShowProps,
  getTriggerType,
} from './ContextMenuTrigger.utils';
import { CONTEXT_MENU_ID, ContextMenuTriggerType } from './contextMenu.types';
import { onlyHasProperty } from './utils';

describe('Utils', () => {
  describe('onlyHasProperty', () => {
    type OptionalObject = Record<string, unknown>;
    const REQUIRED_PROP_NAME = 'atoms';
    const ANOTHER_PROP_NAME = 'bonds';
    const ANOTHER_PROP_NAME2 = 'sgroups';

    const testTable: [OptionalObject, string, string[] | undefined, boolean][] =
      [
        [{}, REQUIRED_PROP_NAME, undefined, false],
        [{ [ANOTHER_PROP_NAME]: null }, REQUIRED_PROP_NAME, undefined, false],
        [
          { [ANOTHER_PROP_NAME]: null, [ANOTHER_PROP_NAME2]: null },
          REQUIRED_PROP_NAME,
          undefined,
          false,
        ],
        [
          { [REQUIRED_PROP_NAME]: null, [ANOTHER_PROP_NAME2]: null },
          REQUIRED_PROP_NAME,
          undefined,
          false,
        ],
        [{ [REQUIRED_PROP_NAME]: null }, REQUIRED_PROP_NAME, undefined, true],
        [
          { [REQUIRED_PROP_NAME]: null, [ANOTHER_PROP_NAME2]: null },
          REQUIRED_PROP_NAME,
          [ANOTHER_PROP_NAME2],
          true,
        ],
        [
          {
            [REQUIRED_PROP_NAME]: null,
            [ANOTHER_PROP_NAME]: null,
            [ANOTHER_PROP_NAME2]: null,
          },
          REQUIRED_PROP_NAME,
          [ANOTHER_PROP_NAME, ANOTHER_PROP_NAME2],
          true,
        ],
      ];

    it.each(testTable)(
      'Should check that only a required field is present in the object except ignore list',
      (testObject, requiredPropName, ignoreList, expectedResult) => {
        const result = onlyHasProperty(
          testObject,
          requiredPropName,
          ignoreList,
        );
        expect(result).toBe(expectedResult);
      },
    );
  });

  describe('getTriggerType', () => {
    const item = { id: 1, map: 'atoms', dist: 0 } as const;
    const selectedFunctionalGroups = new Map();
    const selectedSGroupsIds = new Set<number>();

    it('returns closest item when there is no selection', () => {
      expect(
        getTriggerType({
          item,
          selection: null,
          selectedFunctionalGroups,
          selectedSGroupsIds,
        }),
      ).toBe(ContextMenuTriggerType.ClosestItem);
    });

    it('returns selection when the item is inside the selection', () => {
      expect(
        getTriggerType({
          item,
          selection: { atoms: [1] },
          selectedFunctionalGroups,
          selectedSGroupsIds,
        }),
      ).toBe(ContextMenuTriggerType.Selection);
    });

    it('returns none for non-atom or bond selections without multitail arrows', () => {
      expect(
        getTriggerType({
          item: { id: 10, map: 'rxnPluses', dist: 0 },
          selection: { rxnPluses: [10] },
          selectedFunctionalGroups,
          selectedSGroupsIds,
        }),
      ).toBe(ContextMenuTriggerType.None);
    });

    it('returns closest item for multitail-only selections', () => {
      expect(
        getTriggerType({
          item: { id: 10, map: MULTITAIL_ARROW_KEY, dist: 0 },
          selection: { [MULTITAIL_ARROW_KEY]: [10] },
          selectedFunctionalGroups,
          selectedSGroupsIds,
        }),
      ).toBe(ContextMenuTriggerType.ClosestItem);
    });
  });

  describe('getShouldResetSelection', () => {
    it('returns true when the closest item is outside the selection', () => {
      expect(
        getShouldResetSelection({
          item: { id: 2, map: 'atoms', dist: 0 },
          selection: { atoms: [1] },
          selectedFunctionalGroups: new Map(),
          selectedSGroupsIds: new Set<number>(),
        }),
      ).toBe(true);
    });

    it('returns false when the closest item is inside the selection', () => {
      expect(
        getShouldResetSelection({
          item: { id: 1, map: 'atoms', dist: 0 },
          selection: { atoms: [1] },
          selectedFunctionalGroups: new Map(),
          selectedSGroupsIds: new Set<number>(),
        }),
      ).toBe(false);
    });
  });

  describe('getShowProps', () => {
    const editor = {} as Parameters<typeof getShowProps>[0]['editor'];

    it('returns null when trigger type resolves to none', () => {
      expect(
        getShowProps({
          editor,
          item: { id: 10, map: 'rxnPluses', dist: 0 },
          selection: { rxnPluses: [10] },
          selectedFunctionalGroups: new Map(),
          selectedSGroupsIds: new Set<number>(),
          ketcherId: 'test',
        }),
      ).toBeNull();
    });

    it('returns selection menu props through the factory method', () => {
      expect(
        getShowProps({
          editor,
          item: { id: 1, map: 'atoms', dist: 0 },
          selection: { atoms: [1] },
          selectedFunctionalGroups: new Map(),
          selectedSGroupsIds: new Set<number>(),
          ketcherId: 'test',
        }),
      ).toEqual({
        id: CONTEXT_MENU_ID.FOR_ATOMS + 'test',
        atomIds: [1],
        extraItemsSelected: false,
      });
    });
  });
});
