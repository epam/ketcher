import { createPortal } from 'react-dom';
import { type ItemParams } from 'react-contexify';
import { type MonomerItemType } from 'ketcher-core';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { ContextMenu } from 'components/contextMenu/ContextMenu';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';

type LibraryMenuProps = { libraryItem?: MonomerItemType };

export const MonomerLibraryContextMenu = () => {
  const editor = useAppSelector(selectEditor);
  const root = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );
  const editingDisabled = ({ props }: { props?: object }) => {
    const item = (props as LibraryMenuProps | undefined)?.libraryItem;
    return (
      !item || Boolean(item.props.unresolved) || item.struct.atoms.size === 0
    );
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
      editor.removeMonomerFromLibrary(libraryItem);
    }
  };

  return root
    ? createPortal(
        <ContextMenu
          id={CONTEXT_MENU_ID.FOR_MONOMER_LIBRARY}
          menuItems={[
            { name: 'edit', title: 'Edit...', disabled: editingDisabled },
            {
              name: 'duplicateandedit',
              title: 'Duplicate and Edit...',
              disabled: editingDisabled,
              separator: true,
            },
            {
              name: 'delete',
              title: 'Delete',
              disabled: ({ props }) => {
                const item = (props as LibraryMenuProps | undefined)
                  ?.libraryItem;
                return !item || !editor || editor.isMonomerUsedInPreset(item);
              },
            },
          ]}
          handleMenuChange={handleMenuChange}
        />,
        root,
      )
    : null;
};
