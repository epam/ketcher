import { createPortal } from 'react-dom';
import { type ItemParams } from 'react-contexify';
import { type MonomerItemType } from 'ketcher-core';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { deletePreset, selectRnaBuilderSlice } from 'state/rna-builder';
import { ContextMenu } from 'components/contextMenu/ContextMenu';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';
import {
  deleteMonomerWithPresets,
  getDeleteConfirmation,
  getReferencingCustomPresets,
} from './MonomerLibraryContextMenu.utils';

type LibraryMenuProps = { libraryItem?: MonomerItemType };

export const MonomerLibraryContextMenu = () => {
  const editor = useAppSelector(selectEditor);
  const dispatch = useAppDispatch();
  const { presetsCustom } = useAppSelector(selectRnaBuilderSlice);
  const root = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );
  const editingDisabled = ({ props }: { props?: object }) => {
    const item = (props as LibraryMenuProps | undefined)?.libraryItem;
    return (
      !item || Boolean(item.props.unresolved) || item.struct.atoms.size === 0
    );
  };

  const isDeleteHidden = ({ props }: { props?: object }) => {
    const item = (props as LibraryMenuProps | undefined)?.libraryItem;
    return !item || !editor || !editor.isUserMadeMonomer(item);
  };

  const handleMenuChange = ({ id, props }: ItemParams<LibraryMenuProps>) => {
    const libraryItem = props?.libraryItem;
    if (!editor || !libraryItem) {
      return;
    }
    if (id === 'edit' || id === 'duplicateandedit') {
      editor.events.openMonomerCreationWizard.dispatch({
        mode: id === 'edit' ? 'library' : 'duplicate',
        libraryItem,
      });
    } else if (id === 'delete') {
      const referencingPresets = editor.getReferencingPresets(libraryItem);
      const referencingCustomPresets = getReferencingCustomPresets(
        libraryItem,
        presetsCustom,
      );
      const deleteMonomer = () => {
        referencingCustomPresets.forEach((preset) =>
          dispatch(deletePreset(preset)),
        );
        deleteMonomerWithPresets(
          editor,
          libraryItem,
          referencingPresets,
          presetsCustom,
          (preset) => dispatch(deletePreset(preset)),
        );
      };
      const confirmation = getDeleteConfirmation(
        editor.isMonomerPlacedOnCanvas(libraryItem),
        referencingPresets.length > 0 || referencingCustomPresets.length > 0,
      );

      if (confirmation) {
        editor.events.openConfirmationDialog.dispatch({
          ...confirmation,
          onConfirm: deleteMonomer,
        });
      } else {
        deleteMonomer();
      }
    }
  };

  return root
    ? createPortal(
        <ContextMenu
          id={CONTEXT_MENU_ID.FOR_MONOMER_LIBRARY}
          menuItems={[
            { name: 'edit', title: 'Edit', disabled: editingDisabled },
            {
              name: 'duplicateandedit',
              title: 'Duplicate and Edit',
              disabled: editingDisabled,
            },
            {
              name: 'delete',
              title: 'Delete',
              itemClassName: 'context_menu-delete-item',
              hidden: isDeleteHidden,
              disabled: ({ props }) => {
                const item = (props as LibraryMenuProps | undefined)
                  ?.libraryItem;
                return (
                  !item || !editor || editor.isMonomerReferencedInLibrary(item)
                );
              },
            },
          ]}
          handleMenuChange={handleMenuChange}
        />,
        root,
      )
    : null;
};
