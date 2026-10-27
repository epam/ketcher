import { renderHook } from '@testing-library/react';
import { BaseMonomer, CoreEditor } from 'ketcher-core';
import { getMonomerCreationMenuState } from './monomerCreation.helpers';
import { useMonomerCreationMenu } from './useMonomerCreationMenu';

jest.mock('./monomerCreation.helpers');

describe('useMonomerCreationMenu', () => {
  const monomer = {
    monomerItem: { label: 'A', props: { MonomerCode: 'A' } },
  } as BaseMonomer;
  const openWizard = jest.fn();
  const confirm = jest.fn();
  const showMonomersHighlight = jest.fn();
  const hideMonomersHighlight = jest.fn();
  const updateTransientView = jest.fn();
  const editor = {
    drawingEntitiesManager: {},
    events: {
      openMonomerCreationWizard: { dispatch: openWizard },
      openConfirmationDialog: { dispatch: confirm },
    },
    transientDrawingView: {
      showMonomersHighlight,
      hideMonomersHighlight,
      update: updateTransientView,
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

  describe('highlight of the monomers that will be edited', () => {
    it('marks all matching monomers like "Modify amino acids" does', () => {
      const { result } = renderHook(() =>
        useMonomerCreationMenu(editor, [monomer]),
      );

      result.current.menuItems[1].onMouseOver?.('edit_all_monomers');

      expect(showMonomersHighlight).toHaveBeenCalledWith({
        monomers: state.matchingMonomers,
      });
      expect(updateTransientView).toHaveBeenCalled();
      expect(hideMonomersHighlight).not.toHaveBeenCalled();
    });

    it('removes the marks when the pointer leaves the item', () => {
      const { result } = renderHook(() =>
        useMonomerCreationMenu(editor, [monomer]),
      );
      result.current.menuItems[1].onMouseOver?.('edit_all_monomers');
      updateTransientView.mockClear();
      hideMonomersHighlight.mockClear();

      result.current.menuItems[1].onMouseOut?.('edit_all_monomers');

      expect(hideMonomersHighlight).toHaveBeenCalledTimes(1);
      expect(updateTransientView).toHaveBeenCalledTimes(1);
    });

    it('removes the marks when the menu closes and when it unmounts', () => {
      const { result, unmount } = renderHook(() =>
        useMonomerCreationMenu(editor, [monomer]),
      );
      result.current.menuItems[1].onMouseOver?.('edit_all_monomers');
      hideMonomersHighlight.mockClear();

      result.current.onVisibilityChange(false);
      expect(hideMonomersHighlight).toHaveBeenCalledTimes(1);

      result.current.menuItems[1].onMouseOver?.('edit_all_monomers');
      hideMonomersHighlight.mockClear();
      unmount();
      expect(hideMonomersHighlight).toHaveBeenCalledTimes(1);
    });

    it('removes the marks when an entry of the menu is chosen', () => {
      const { result } = renderHook(() =>
        useMonomerCreationMenu(editor, [monomer]),
      );
      result.current.menuItems[1].onMouseOver?.('edit_all_monomers');
      hideMonomersHighlight.mockClear();

      result.current.handleMenuChange('edit_all_monomers');

      expect(hideMonomersHighlight).toHaveBeenCalledTimes(1);
    });

    it('does nothing to the overlay when no marks are shown', () => {
      const { result, unmount } = renderHook(() =>
        useMonomerCreationMenu(editor, [monomer]),
      );

      result.current.onVisibilityChange(false);
      unmount();

      expect(hideMonomersHighlight).not.toHaveBeenCalled();
      expect(updateTransientView).not.toHaveBeenCalled();
    });

    it('does not use the hover state of the monomers', () => {
      const turnOnHover = jest.fn();
      const hoverableMonomer = {
        ...monomer,
        turnOnHover,
      } as unknown as BaseMonomer;
      jest.mocked(getMonomerCreationMenuState).mockReturnValue({
        ...state,
        matchingMonomers: [hoverableMonomer],
      });
      const { result } = renderHook(() =>
        useMonomerCreationMenu(editor, [hoverableMonomer]),
      );

      result.current.menuItems[1].onMouseOver?.('edit_all_monomers');

      expect(turnOnHover).not.toHaveBeenCalled();
    });
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
    expect(showMonomersHighlight).not.toHaveBeenCalled();
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
