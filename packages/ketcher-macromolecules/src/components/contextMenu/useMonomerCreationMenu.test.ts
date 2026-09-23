import { renderHook } from '@testing-library/react';
import { BaseMonomer, CoreEditor } from 'ketcher-core';
import {
  getMonomerCreationMenuState,
  highlightMonomers,
} from './monomerCreation.helpers';
import { useMonomerCreationMenu } from './useMonomerCreationMenu';

jest.mock('./monomerCreation.helpers');

describe('useMonomerCreationMenu', () => {
  const monomer = {
    monomerItem: { label: 'A', props: { MonomerCode: 'A' } },
  } as BaseMonomer;
  const openWizard = jest.fn();
  const confirm = jest.fn();
  const clearHighlight = jest.fn();
  const editor = {
    drawingEntitiesManager: {},
    events: {
      openMonomerCreationWizard: { dispatch: openWizard },
      openConfirmationDialog: { dispatch: confirm },
    },
  } as unknown as CoreEditor;
  const state = {
    monomer,
    matchingMonomers: [monomer, monomer],
    canCreate: false,
    showEdit: true,
    editDisabled: false,
    editAllDisabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getMonomerCreationMenuState).mockReturnValue(state);
    jest.mocked(highlightMonomers).mockReturnValue(clearHighlight);
  });

  it('orders the editing entries and separates them from Delete', () => {
    const { result } = renderHook(() =>
      useMonomerCreationMenu(editor, [monomer]),
    );
    expect(
      result.current.menuItems.map(({ title, separator }) => ({
        title,
        separator,
      })),
    ).toEqual([
      { title: 'Edit Monomer', separator: undefined },
      { title: 'Edit All A (2)', separator: true },
    ]);
  });

  it('requests instance editing for the context monomer', () => {
    const { result } = renderHook(() =>
      useMonomerCreationMenu(editor, [monomer]),
    );
    expect(result.current.handleMenuChange('edit_monomer')).toBe(true);
    expect(openWizard).toHaveBeenCalledWith({ mode: 'instance', monomer });
  });

  it('confirms before editing all matching instances', () => {
    const { result } = renderHook(() =>
      useMonomerCreationMenu(editor, [monomer]),
    );
    result.current.handleMenuChange('edit_all_monomers');
    expect(openWizard).not.toHaveBeenCalled();
    expect(confirm.mock.calls[0][0].confirmationText).toContain('2 monomers');
    confirm.mock.calls[0][0].onConfirm();
    expect(openWizard).toHaveBeenCalledWith({ mode: 'all', monomer });
  });

  it('clears highlights when the menu closes and when it unmounts', () => {
    const { result, unmount } = renderHook(() =>
      useMonomerCreationMenu(editor, [monomer]),
    );
    result.current.menuItems[1].onMouseOver?.('edit_all_monomers');
    expect(highlightMonomers).toHaveBeenCalledWith(state.matchingMonomers);
    result.current.onVisibilityChange(false);
    expect(clearHighlight).toHaveBeenCalledTimes(1);
    result.current.menuItems[1].onMouseOver?.('edit_all_monomers');
    unmount();
    expect(clearHighlight).toHaveBeenCalledTimes(2);
  });

  it('does not highlight or edit a disabled composite symbol', () => {
    jest.mocked(getMonomerCreationMenuState).mockReturnValue({
      ...state,
      editDisabled: true,
      editAllDisabled: true,
    });
    const { result } = renderHook(() =>
      useMonomerCreationMenu(editor, [monomer], true),
    );
    result.current.menuItems[1].onMouseOver?.('edit_all_monomers');
    expect(result.current.handleMenuChange('edit_monomer')).toBe(false);
    expect(result.current.handleMenuChange('edit_all_monomers')).toBe(false);
    expect(highlightMonomers).not.toHaveBeenCalled();
    expect(openWizard).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  it('offers only Create monomer for a chemical structure', () => {
    jest.mocked(getMonomerCreationMenuState).mockReturnValue({
      ...state,
      canCreate: true,
      showEdit: false,
    });
    const { result } = renderHook(() => useMonomerCreationMenu(editor, []));
    expect(result.current.menuItems).toEqual([
      { name: 'create_monomer', title: 'Create monomer', separator: true },
    ]);
    result.current.handleMenuChange('create_monomer');
    expect(openWizard).toHaveBeenCalledWith({ mode: 'create' });
  });
});
