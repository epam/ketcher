import { renderHook } from '@testing-library/react';
import useFunctionalGroupEoc from './useFunctionalGroupEoc';
import {
  Action,
  ketcherProvider,
  setExpandMonomerSGroup,
  setExpandSGroup,
  type FunctionalGroup,
} from 'ketcher-core';
import type {
  ItemEventParams,
  FunctionalGroupsContextMenuProps,
} from '../contextMenu.types';

jest.mock('ketcher-core', () => ({
  Action: jest.fn().mockImplementation(() => ({
    mergeWith: jest.fn(),
  })),
  ketcherProvider: {
    getKetcher: jest.fn(() => ({
      editor: {
        render: { ctab: {} },
        update: jest.fn(),
        rotateController: {
          rerender: jest.fn(),
        },
      },
    })),
  },
  setExpandMonomerSGroup: jest.fn(() => ({})),
  setExpandSGroup: jest.fn(() => ({})),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

jest.mock('src/hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test-ketcher-id' }),
}));

jest.mock('src/script/ui/state/functionalGroups', () => ({
  highlightFG: jest.fn(),
}));

describe('useFunctionalGroupEoc', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handler function', () => {
    it('uses setExpandSGroup for multi-selection collapse to avoid unstable monomer-specific path', () => {
      const { result } = renderHook(() => useFunctionalGroupEoc());
      const [handler] = result.current;

      const functionalGroup1 = {
        name: 'FG1',
        isExpanded: true,
        relatedSGroupId: 1,
      } as FunctionalGroup;
      const functionalGroup2 = {
        name: 'FG2',
        isExpanded: true,
        relatedSGroupId: 2,
      } as FunctionalGroup;

      const params: ItemEventParams<FunctionalGroupsContextMenuProps> = {
        props: {
          id: 'test',
          functionalGroups: [functionalGroup1, functionalGroup2],
        },
      } as ItemEventParams<FunctionalGroupsContextMenuProps>;

      handler(params, false);

      expect(ketcherProvider.getKetcher).toHaveBeenCalledWith(
        'test-ketcher-id',
      );
      expect(setExpandSGroup).toHaveBeenCalledTimes(2);
      expect(setExpandSGroup).toHaveBeenNthCalledWith(1, {}, 1, {
        expanded: false,
      });
      expect(setExpandSGroup).toHaveBeenNthCalledWith(2, {}, 2, {
        expanded: false,
      });
      expect(setExpandMonomerSGroup).not.toHaveBeenCalled();
      expect(Action).toHaveBeenCalledTimes(1);

      const editor = (ketcherProvider.getKetcher as jest.Mock).mock.results[0]
        .value.editor;
      expect(editor.update).toHaveBeenCalledTimes(1);
      expect(editor.rotateController.rerender).toHaveBeenCalledTimes(1);
    });

    it('uses setExpandMonomerSGroup for multi-selection expand to preserve readable layout', () => {
      const { result } = renderHook(() => useFunctionalGroupEoc());
      const [handler] = result.current;

      const functionalGroup1 = {
        name: 'FG1',
        isExpanded: false,
        relatedSGroupId: 1,
      } as FunctionalGroup;
      const functionalGroup2 = {
        name: 'FG2',
        isExpanded: false,
        relatedSGroupId: 2,
      } as FunctionalGroup;

      const params: ItemEventParams<FunctionalGroupsContextMenuProps> = {
        props: {
          id: 'test',
          functionalGroups: [functionalGroup1, functionalGroup2],
        },
      } as ItemEventParams<FunctionalGroupsContextMenuProps>;

      handler(params, true);

      expect(setExpandMonomerSGroup).toHaveBeenCalledTimes(2);
      expect(setExpandMonomerSGroup).toHaveBeenNthCalledWith(1, {}, 1, {
        expanded: true,
      });
      expect(setExpandMonomerSGroup).toHaveBeenNthCalledWith(2, {}, 2, {
        expanded: true,
      });
      expect(setExpandSGroup).not.toHaveBeenCalled();
    });
  });

  describe('hidden function', () => {
    it('should hide Contract Abbreviation when functional group has empty name', () => {
      const { result } = renderHook(() => useFunctionalGroupEoc());
      const [, hidden] = result.current;

      const mockFunctionalGroup = {
        name: '',
        isExpanded: true,
        relatedSGroupId: 1,
      } as FunctionalGroup;

      const params: ItemEventParams<FunctionalGroupsContextMenuProps> = {
        props: {
          id: 'test',
          functionalGroups: [mockFunctionalGroup],
        },
      } as ItemEventParams<FunctionalGroupsContextMenuProps>;

      // toExpand = false means "Contract Abbreviation"
      const shouldHide = hidden(params, false);
      expect(shouldHide).toBe(true);
    });

    it('should hide Contract Abbreviation when functional group name is only whitespace', () => {
      const { result } = renderHook(() => useFunctionalGroupEoc());
      const [, hidden] = result.current;

      const mockFunctionalGroup = {
        name: '   ',
        isExpanded: true,
        relatedSGroupId: 1,
      } as FunctionalGroup;

      const params: ItemEventParams<FunctionalGroupsContextMenuProps> = {
        props: {
          id: 'test',
          functionalGroups: [mockFunctionalGroup],
        },
      } as ItemEventParams<FunctionalGroupsContextMenuProps>;

      // toExpand = false means "Contract Abbreviation"
      const shouldHide = hidden(params, false);
      expect(shouldHide).toBe(true);
    });

    it('should not hide Contract Abbreviation when functional group has valid name', () => {
      const { result } = renderHook(() => useFunctionalGroupEoc());
      const [, hidden] = result.current;

      const mockFunctionalGroup = {
        name: 'ABS',
        isExpanded: true,
        relatedSGroupId: 1,
      } as FunctionalGroup;

      const params: ItemEventParams<FunctionalGroupsContextMenuProps> = {
        props: {
          id: 'test',
          functionalGroups: [mockFunctionalGroup],
        },
      } as ItemEventParams<FunctionalGroupsContextMenuProps>;

      // toExpand = false means "Contract Abbreviation"
      const shouldHide = hidden(params, false);
      expect(shouldHide).toBe(false);
    });

    it('should hide Contract Abbreviation if any functional group in the list has empty name', () => {
      const { result } = renderHook(() => useFunctionalGroupEoc());
      const [, hidden] = result.current;

      const mockFunctionalGroup1 = {
        name: 'ABS',
        isExpanded: true,
        relatedSGroupId: 1,
      } as FunctionalGroup;

      const mockFunctionalGroup2 = {
        name: '',
        isExpanded: true,
        relatedSGroupId: 2,
      } as FunctionalGroup;

      const params: ItemEventParams<FunctionalGroupsContextMenuProps> = {
        props: {
          id: 'test',
          functionalGroups: [mockFunctionalGroup1, mockFunctionalGroup2],
        },
      } as ItemEventParams<FunctionalGroupsContextMenuProps>;

      // toExpand = false means "Contract Abbreviation"
      const shouldHide = hidden(params, false);
      expect(shouldHide).toBe(true);
    });

    it('should show Contract Abbreviation when group is already contracted', () => {
      const { result } = renderHook(() => useFunctionalGroupEoc());
      const [, hidden] = result.current;

      const mockFunctionalGroup = {
        name: 'ABS',
        isExpanded: false,
        relatedSGroupId: 1,
      } as FunctionalGroup;

      const params: ItemEventParams<FunctionalGroupsContextMenuProps> = {
        props: {
          id: 'test',
          functionalGroups: [mockFunctionalGroup],
        },
      } as ItemEventParams<FunctionalGroupsContextMenuProps>;

      // toExpand = false means "Contract Abbreviation"
      // Should be hidden because it's already contracted
      const shouldHide = hidden(params, false);
      expect(shouldHide).toBe(true);
    });

    it('should not affect Expand Abbreviation behavior', () => {
      const { result } = renderHook(() => useFunctionalGroupEoc());
      const [, hidden] = result.current;

      const mockFunctionalGroup = {
        name: '',
        isExpanded: false,
        relatedSGroupId: 1,
      } as FunctionalGroup;

      const params: ItemEventParams<FunctionalGroupsContextMenuProps> = {
        props: {
          id: 'test',
          functionalGroups: [mockFunctionalGroup],
        },
      } as ItemEventParams<FunctionalGroupsContextMenuProps>;

      // toExpand = true means "Expand Abbreviation"
      // Empty name should not affect expand operation
      const shouldHide = hidden(params, true);
      expect(shouldHide).toBe(false);
    });
  });
});
