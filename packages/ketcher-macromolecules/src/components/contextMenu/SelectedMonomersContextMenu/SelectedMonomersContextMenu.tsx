import { ItemParams } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { BaseMonomer } from 'ketcher-core';
import { ContextMenu } from 'components/contextMenu/ContextMenu';
import {
  isAntisenseCreationDisabled,
  isAntisenseOptionVisible,
} from './helpers';

type SelectedMonomersContextMenuType = {
  selectedMonomers: BaseMonomer[];
};

export const SelectedMonomersContextMenu = ({
  selectedMonomers,
}: SelectedMonomersContextMenuType) => {
  const editor = useAppSelector(selectEditor);

  const menuItems = [
    {
      name: 'copy',
      title: 'Copy',
    },
    {
      name: 'create_antisense_rna_chain',
      title: 'Create Antisense RNA Strand',
      separator: false,
      disabled: isAntisenseCreationDisabled(selectedMonomers),
      hidden: ({ props }: { props?: { selectedMonomers?: BaseMonomer[] } }) => {
        return (
          !props?.selectedMonomers ||
          !isAntisenseOptionVisible(props?.selectedMonomers)
        );
      },
    },
    {
      name: 'create_antisense_dna_chain',
      title: 'Create Antisense DNA Strand',
      separator: true,
      disabled: isAntisenseCreationDisabled(selectedMonomers),
      hidden: ({ props }: { props?: { selectedMonomers?: BaseMonomer[] } }) => {
        return (
          !props?.selectedMonomers ||
          !isAntisenseOptionVisible(props?.selectedMonomers)
        );
      },
    },
    {
      name: 'delete',
      title: 'Delete',
    },
  ];

  const handleMenuChange = ({ id }: ItemParams) => {
    switch (id) {
      case 'copy':
        editor.events.copySelectedStructure.dispatch();
        break;
      case 'create_antisense_rna_chain':
        editor.events.createAntisenseChain.dispatch(false);
        break;
      case 'create_antisense_dna_chain':
        editor.events.createAntisenseChain.dispatch(true);
        break;
      case 'delete':
        editor.events.deleteSelectedStructure.dispatch();
        break;
      default:
        break;
    }
  };

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );

  return (
    ketcherEditorRootElement &&
    createPortal(
      <ContextMenu
        id={CONTEXT_MENU_ID.FOR_SELECTED_MONOMERS}
        handleMenuChange={handleMenuChange}
        menuItems={menuItems}
      ></ContextMenu>,
      ketcherEditorRootElement,
    )
  );
};
