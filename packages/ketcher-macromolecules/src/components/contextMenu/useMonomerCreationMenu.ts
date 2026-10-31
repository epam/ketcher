import { useEffect, useRef } from 'react';
import { BaseMonomer, CoreEditor } from 'ketcher-core';
import { MenuItem } from './ContextMenu';
import { getMonomerCreationMenuState } from './monomerCreation.helpers';

export const useMonomerCreationMenu = (
  editor: CoreEditor | undefined,
  monomers: BaseMonomer[],
  isCompositeSymbol = false,
) => {
  const clearHover = useRef<(() => void) | undefined>(undefined);
  const clearHighlight = () => {
    clearHover.current?.();
    clearHover.current = undefined;
  };
  // Marks the monomers with the same indicator as "Modify amino acids"
  const showHighlight = (
    targetEditor: CoreEditor,
    monomersToHighlight: BaseMonomer[],
  ) => {
    const { transientDrawingView } = targetEditor;
    transientDrawingView.showMonomersHighlight({
      monomers: monomersToHighlight,
    });
    transientDrawingView.update();
    clearHover.current = () => {
      transientDrawingView.hideMonomersHighlight();
      transientDrawingView.update();
    };
  };
  useEffect(() => () => clearHover.current?.(), []);

  const state = editor
    ? getMonomerCreationMenuState(
        editor.drawingEntitiesManager,
        monomers,
        isCompositeSymbol,
      )
    : undefined;
  const monomerCode = state?.monomer
    ? (state.monomer.monomerItem.props.MonomerCode ??
      state.monomer.monomerItem.label)
    : '';
  const menuItems: MenuItem[] = [
    ...(state?.canCreate
      ? [
          {
            name: 'create_monomer',
            title: 'Create monomer',
            separator: !state.showEdit,
          },
        ]
      : []),
    ...(state?.showEdit
      ? [
          {
            name: 'edit_monomer',
            title: 'Edit Monomer',
            disabled: state.editDisabled,
          },
          {
            name: 'edit_all_monomers',
            title: `Edit All ${monomerCode} (${state.matchingMonomers.length})`,
            disabled: state.editAllDisabled,
            separator: true,
            onMouseOver: () => {
              clearHighlight();
              if (editor && !state.editAllDisabled) {
                showHighlight(editor, state.matchingMonomers);
              }
            },
            onMouseOut: clearHighlight,
          },
        ]
      : []),
  ];

  const handleMenuChange = (id?: string) => {
    clearHighlight();
    if (!editor || !state) return false;
    if (id === 'create_monomer' && state.canCreate) {
      editor.events.openMonomerCreationWizard.dispatch({ mode: 'create' });
      return true;
    }
    if (id === 'edit_monomer' && !state.editDisabled) {
      editor.events.openMonomerCreationWizard.dispatch({
        mode: 'instance',
        monomer: state.monomer,
      });
      return true;
    }
    if (id === 'edit_all_monomers' && !state.editAllDisabled) {
      editor.events.openConfirmationDialog.dispatch({
        title: 'Editing monomers',
        confirmationText: `You are going to edit ${state.matchingMonomers.length} monomers. Are you sure?`,
        onConfirm: () => {
          editor.events.openMonomerCreationWizard.dispatch({
            mode: 'all',
            monomer: state.monomer,
          });
        },
      });
      return true;
    }
    return false;
  };

  return {
    menuItems,
    handleMenuChange,
    onVisibilityChange: (isVisible: boolean) => {
      if (!isVisible) clearHighlight();
    },
  };
};
