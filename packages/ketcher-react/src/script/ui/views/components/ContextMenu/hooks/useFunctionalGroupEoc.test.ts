import { renderHook } from '@testing-library/react';
import useFunctionalGroupEoc from './useFunctionalGroupEoc';
import {
  Atom,
  Bond,
  ketcherProvider,
  Render,
  ReStruct,
  SGroup,
  SGroupAttachmentPoint,
  Struct,
  Vec2,
  type FunctionalGroup,
  type RenderOptions,
} from 'ketcher-core';
import type {
  ItemEventParams,
  FunctionalGroupsContextMenuProps,
} from '../contextMenu.types';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

jest.mock('src/hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test-ketcher-id' }),
}));

jest.mock('src/script/ui/state/functionalGroups', () => ({
  highlightFG: jest.fn(),
}));

function buildStructWithContractedFunctionalGroup() {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  const restruct = new ReStruct(new Struct(), render);
  const struct = restruct.molecule;

  const addAtom = (label: string, x: number, y: number) =>
    struct.atoms.add(new Atom({ label, pp: new Vec2(x, y), fragment: 0 }));
  const addBond = (begin: number, end: number) => {
    const bond = new Bond({ begin, end, type: Bond.PATTERN.TYPE.SINGLE });
    const bondId = struct.bonds.add(bond);
    struct.bondInitHalfBonds(bondId, bond);
  };

  const outsideAtomIds = [addAtom('C', 0, 0), addAtom('C', 1, 0)];
  const attachmentAtomId = addAtom('C', 1.866, -0.5);
  const groupAtomIds = [attachmentAtomId, addAtom('O', 2.732, 0)];
  addBond(outsideAtomIds[0], outsideAtomIds[1]);
  addBond(outsideAtomIds[1], attachmentAtomId);
  addBond(groupAtomIds[0], groupAtomIds[1]);
  struct.initNeighbors();

  const sgroup = new SGroup(SGroup.TYPES.SUP);
  const sgroupId = struct.sgroups.add(sgroup);
  sgroup.id = sgroupId;
  sgroup.data.name = 'FG';
  sgroup.data.expanded = false;
  groupAtomIds.forEach((atomId) => struct.atomAddToSGroup(sgroupId, atomId));
  sgroup.addAttachmentPoint(
    new SGroupAttachmentPoint(attachmentAtomId, undefined, undefined),
  );

  return { restruct, struct, sgroupId, outsideAtomIds };
}

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

    it('should not hide Contract Abbreviation for a nucleotide component', () => {
      const { result } = renderHook(() => useFunctionalGroupEoc());
      const [, hidden] = result.current;

      const sgroup = new SGroup(SGroup.TYPES.SUP);
      sgroup.data.class = 'BASE';
      const mockFunctionalGroup = {
        name: '',
        isExpanded: true,
        relatedSGroupId: 1,
        relatedSGroup: sgroup,
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

  describe('handler', () => {
    it('keeps the layout of the attached structure when expanding a functional group', () => {
      const { restruct, struct, sgroupId, outsideAtomIds } =
        buildStructWithContractedFunctionalGroup();
      const editor = {
        render: { ctab: restruct },
        update: jest.fn(),
        rotateController: { rerender: jest.fn() },
      };
      jest
        .spyOn(ketcherProvider, 'getKetcher')
        .mockReturnValue({ editor } as unknown as ReturnType<
          typeof ketcherProvider.getKetcher
        >);
      const positionsBefore = outsideAtomIds.map(
        (atomId) => new Vec2(struct.atoms.get(atomId)?.pp ?? new Vec2()),
      );

      const { result } = renderHook(() => useFunctionalGroupEoc());
      const [handler] = result.current;
      const params = {
        props: {
          id: 'test',
          functionalGroups: [{ relatedSGroupId: sgroupId } as FunctionalGroup],
        },
      } as ItemEventParams<FunctionalGroupsContextMenuProps>;

      handler(params, true);

      expect(struct.sgroups.get(sgroupId)?.isExpanded()).toBe(true);
      expect(
        outsideAtomIds.map((atomId) => struct.atoms.get(atomId)?.pp),
      ).toEqual(positionsBefore);
    });
  });
});
