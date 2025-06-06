import { ItemParams } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import {
  KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  Icon,
  IconName,
} from 'ketcher-react';
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
  const editor = useAppSelector(selectEditor);
  const monomersForAminoAcidModification = getMonomersForAminoAcidModification(
    selectedMonomers,
    contextMenuEvent,
  );
  const isCanvasContext = (props?: {
    selectedMonomers?: BaseMonomer[];
    polymerBondRenderer?: unknown;
  }) =>
    !props?.polymerBondRenderer &&
    (!props?.selectedMonomers || props?.selectedMonomers.length === 0);

  const modifyAminoAcidsMenuItems = getModifyAminoAcidsMenuItems(
    monomersForAminoAcidModification,
  );
  const isBondContext = (props?: { polymerBondRenderer?: unknown }) =>
    !!props?.polymerBondRenderer;

  const menuItems = [
    {
      name: 'copy',
      title: 'Copy',
      icon: <Icon name={'copyMenu' as IconName} />,
      disabled: ({ props = {} }) =>
        isBondContext(props) || isCanvasContext(props),
    },
    {
      name: SequenceItemContextMenuNames.paste,
      title: 'Paste',
      icon: <Icon name={'pasteNavBar' as IconName} />,
      disabled: ({ props = {} }) => !isCanvasContext(props),
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
      name: 'edit_connection_points',
      title: 'Edit Connection Points...',
      separator: true,
      disabled: ({
        props,
      }: {
        props?: {
          polymerBondRenderer?: unknown;
          selectedMonomers?: BaseMonomer[];
        };
      }) => !isBondContext(props),
    },
    {
      name: 'delete',
      title: 'Delete',
      icon: <Icon name={'deleteMenu' as IconName} />,
      disabled: ({ props = {} }) =>
        isBondContext(props) || isCanvasContext(props),
    },
  ];

  const handleMenuChange = ({ id: menuItemId, props }: ItemParams) => {
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
      case menuItemId === 'paste':
        editor.events.pasteFromClipboard.dispatch();
        break;
      case menuItemId === 'edit_connection_points': {
        const polymerBond = props?.polymerBondRenderer?.polymerBond;
        if (!polymerBond) return;

        editor.events.openMonomerConnectionModal.dispatch({
          firstMonomer: polymerBond.firstMonomer,
          secondMonomer: polymerBond.secondMonomer,
          polymerBond,
          isReconnectionDialog: true,
        });
        break;
      }
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
