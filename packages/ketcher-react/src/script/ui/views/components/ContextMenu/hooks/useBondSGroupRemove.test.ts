import { act, renderHook } from '@testing-library/react';
import { Pile, fromSgroupDeletion, ketcherProvider } from 'ketcher-core';
import useBondSGroupRemove from './useBondSGroupRemove';
import type {
  BondsContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';

jest.mock('src/hooks', () => ({
  useAppContext: () => ({ ketcherId: 'ketcher-id' }),
}));

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  ketcherProvider: { getKetcher: jest.fn() },
  fromSgroupDeletion: jest.fn(() => 'remove-sgroup-action'),
  FunctionalGroup: {
    isFunctionalGroup: (sGroup: { isFunctionalGroup?: boolean }) =>
      sGroup.isFunctionalGroup === true,
  },
}));

const BOND_ID = 7;
const DATA_SGROUP = 10;
const OTHER_SGROUP = 11;
const UNLABELLED_SUPERATOM = 12;
const FUNCTIONAL_GROUP = 13;
const MONOMER = 14;

const sGroupItem = (overrides: Record<string, boolean> = {}) => ({
  item: {
    isSuperatomWithoutLabel: false,
    isMonomer: false,
    isFunctionalGroup: false,
    ...overrides,
  },
});

const setUp = (
  sGroupIds: number[],
  { monomerWizardActive = false }: { monomerWizardActive?: boolean } = {},
) => {
  const molecule = {};
  const ctab = {
    molecule,
    sgroups: new Map([
      [DATA_SGROUP, sGroupItem()],
      [OTHER_SGROUP, sGroupItem()],
      [UNLABELLED_SUPERATOM, sGroupItem({ isSuperatomWithoutLabel: true })],
      [FUNCTIONAL_GROUP, sGroupItem({ isFunctionalGroup: true })],
      [MONOMER, sGroupItem({ isMonomer: true })],
    ]),
    bonds: new Map([
      [
        BOND_ID,
        {
          b: {
            getAttachedSGroups: (struct: unknown) =>
              new Pile<number>(struct === molecule ? sGroupIds : []),
          },
        },
      ],
    ]),
  };
  const editor = {
    render: { ctab },
    update: jest.fn(),
    selection: jest.fn(),
    focusCliparea: jest.fn(),
    isMonomerCreationWizardActive: monomerWizardActive,
  };
  (ketcherProvider.getKetcher as jest.Mock).mockReturnValue({ editor });
  const [handler, disabled, hidden] = renderHook(() => useBondSGroupRemove())
    .result.current;

  return { editor, ctab, handler, disabled, hidden };
};

const params = (bondIds: number[] = [BOND_ID]) =>
  ({
    props: { id: 'menu', bondIds },
  }) as ItemEventParams<BondsContextMenuProps>;

// react-contexify calls `disabled` before `hidden`, as the menu does
const showMenu = (
  disabled: (p: ItemEventParams<BondsContextMenuProps>) => boolean,
  hidden: () => boolean,
  bondIds?: number[],
) => {
  const isDisabled = disabled(params(bondIds));
  return { isDisabled, isHidden: hidden() };
};

describe('Remove S-Group in the bond context menu', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is shown and enabled for a bond in one S-group', () => {
    const { disabled, hidden } = setUp([DATA_SGROUP]);

    expect(showMenu(disabled, hidden)).toEqual({
      isDisabled: false,
      isHidden: false,
    });
  });

  it('is hidden for a bond in no S-group', () => {
    const { disabled, hidden } = setUp([]);

    expect(showMenu(disabled, hidden).isHidden).toBe(true);
  });

  it('is disabled when the bond is in more than one S-group', () => {
    const { disabled, hidden } = setUp([DATA_SGROUP, OTHER_SGROUP]);

    expect(showMenu(disabled, hidden)).toEqual({
      isDisabled: true,
      isHidden: false,
    });
  });

  it('is disabled for several bonds at once', () => {
    const { disabled } = setUp([DATA_SGROUP]);

    expect(disabled(params([BOND_ID, BOND_ID + 1]))).toBe(true);
  });

  it('is disabled while the monomer creation wizard is open', () => {
    const { disabled } = setUp([DATA_SGROUP], { monomerWizardActive: true });

    expect(disabled(params())).toBe(true);
  });

  it.each([
    ['a superatom without a label', UNLABELLED_SUPERATOM],
    ['a functional group', FUNCTIONAL_GROUP],
    ['a monomer', MONOMER],
  ])('is hidden for %s', (_, sGroupId) => {
    const { disabled, hidden } = setUp([sGroupId]);

    expect(showMenu(disabled, hidden).isHidden).toBe(true);
  });

  it('removes the S-group and clears the selection', () => {
    const { editor, ctab, handler, disabled } = setUp([DATA_SGROUP]);
    disabled(params());

    act(() => handler());

    expect(fromSgroupDeletion).toHaveBeenCalledWith(ctab, DATA_SGROUP);
    expect(editor.update).toHaveBeenCalledWith('remove-sgroup-action');
    expect(editor.selection).toHaveBeenCalledWith(null);
    expect(editor.focusCliparea).toHaveBeenCalled();
  });

  it('does nothing when the menu was opened on a bond in no S-group', () => {
    const { editor, handler, disabled } = setUp([]);
    disabled(params());

    act(() => handler());

    expect(editor.update).not.toHaveBeenCalled();
  });
});
