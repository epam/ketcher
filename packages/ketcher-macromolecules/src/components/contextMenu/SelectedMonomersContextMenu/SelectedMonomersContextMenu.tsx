import { ItemParams } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR, Icon } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { BaseMonomer } from 'ketcher-core';
import { ContextMenu } from 'components/contextMenu/ContextMenu';
import {
  AMINO_ACID_MODIFICATION_MENU_ITEM_PREFIX,
  getModifyAminoAcidsMenuItems,
  getMonomersForAminoAcidModification,
  isAntisenseCreationDisabled,
  isAntisenseOptionVisible,
} from './helpers';
import { SequenceItemContextMenuNames } from 'components/contextMenu/SequenceItemContextMenu/SequenceItemContextMenu';
import { PointerEvent } from 'react';

type SelectedMonomersContextMenuType = {
  selectedMonomers?: BaseMonomer[];
  contextMenuEvent?: PointerEvent;
};

export const SelectedMonomersContextMenu = ({
  selectedMonomers: _selectedMonomers,
  contextMenuEvent,
}: SelectedMonomersContextMenuType) => {
  const selectedMonomers = _selectedMonomers || [];
  const isClickOnMonomer = selectedMonomers.length > 0;
  const editor = useAppSelector(selectEditor);
  const monomersForAminoAcidModification = getMonomersForAminoAcidModification(
    selectedMonomers,
    contextMenuEvent,
  );
  const modifyAminoAcidsMenuItems = getModifyAminoAcidsMenuItems(
    monomersForAminoAcidModification,
  );
  const menuItems = [
    {
      name: 'copy',
      title: 'Copy',
      icon: <Icon name="copyMenu" />,
      disabled: !isClickOnMonomer,
    },
    {
      name: SequenceItemContextMenuNames.paste,
      title: 'Paste',
      icon: <Icon name="pasteNavBar" />,
      disabled: isClickOnMonomer,
      separator: false,
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
      name: SequenceItemContextMenuNames.modifyAminoAcids,
      title: 'Modify amino acids',
      disabled: false,
      hidden: !modifyAminoAcidsMenuItems.length,
      subMenuItems: modifyAminoAcidsMenuItems,
    },
    {
      name: 'delete',
      title: 'Delete',
      icon: <Icon name="deleteMenu" />,
      disabled: !isClickOnMonomer,
    },
  ];

  const handleMenuChange = ({ id: menuItemId }: ItemParams) => {
    switch (true) {
      case menuItemId === 'copy':
        editor.events.copySelectedStructure.dispatch();
        break;
      case menuItemId === 'create_antisense_rna_chain':
        editor.events.createAntisenseChain.dispatch(false);
        break;
      case menuItemId === 'create_antisense_dna_chain':
        editor.events.createAntisenseChain.dispatch(true);
        break;
      case menuItemId === 'delete':
        editor.events.deleteSelectedStructure.dispatch();
        break;
      case menuItemId?.startsWith(AMINO_ACID_MODIFICATION_MENU_ITEM_PREFIX): {
        const modificationType = menuItemId?.replace(
          AMINO_ACID_MODIFICATION_MENU_ITEM_PREFIX,
          '',
        );
        editor.events.modifyAminoAcids.dispatch({
          monomers: monomersForAminoAcidModification,
          modificationType,
        });
        break;
      }
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
