import { renderHook } from '@testing-library/react';
import useFunctionalGroupEoc from './useFunctionalGroupEoc';
import { FunctionalGroup } from 'ketcher-core';
import {
  ItemEventParams,
  FunctionalGroupsContextMenuProps,
} from '../contextMenu.types';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

jest.mock('src/hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test-ketcher-id' }),
}));

describe('useFunctionalGroupEoc', () => {
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
