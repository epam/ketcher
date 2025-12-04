import { ItemParams, useContextMenu } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import {
  KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  Icon,
  IconName,
} from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor, selectIsClipboardAvailableForPaste } from 'state/common';
import { BaseMonomer } from 'ketcher-core';
import { ContextMenu } from 'components/contextMenu/ContextMenu';
import {
  AMINO_ACID_MODIFICATION_MENU_ITEM_PREFIX,
  getModifyAminoAcidsMenuItems,
  getMonomersForAminoAcidModification,
  isCycleExistsForSelectedMonomers,
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
  const isClipboardAvailable = useAppSelector(
    selectIsClipboardAvailableForPaste,
  );
  const { hideAll } = useContextMenu({
    id: CONTEXT_MENU_ID.FOR_SELECTED_MONOMERS,
  });
  const monomersForAminoAcidModification = getMonomersForAminoAcidModification(
    selectedMonomers,
    contextMenuEvent,
  );
  const isCanvasContext = (props?: {
    selectedMonomers?: BaseMonomer[];
    polymerBondRenderer?: unknown;
  }) => {
    const hasSelectedEntities =
      (editor?.drawingEntitiesManager?.selectedEntitiesArr?.length ?? 0) > 0;
    return (
      !props?.polymerBondRenderer &&
      (!props?.selectedMonomers || props?.selectedMonomers.length === 0) &&
      !hasSelectedEntities
    );
  };

  const modifyAminoAcidsMenuItems = getModifyAminoAcidsMenuItems(
    monomersForAminoAcidModification,
  );
  const isBondContext = (props?: { polymerBondRenderer?: unknown }) =>
    !!props?.polymerBondRenderer;

  const isAntisenseBlockVisible =
    selectedMonomers &&
    selectedMonomers.length > 0 &&
    isAntisenseOptionVisible(selectedMonomers);

  const cyclicStructureFormationDisabled =
    editor?.mode.modeName !== 'flex-layout-mode' ||
    editor?.drawingEntitiesManager.selectedMicromoleculeEntities.length > 0 ||
    !isCycleExistsForSelectedMonomers(selectedMonomers);

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
      disabled: ({ props = {} }) =>
        !isCanvasContext(props) || !isClipboardAvailable,
      separator: true,
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
      disabled: isAntisenseCreationDisabled(selectedMonomers),
      hidden: ({ props }: { props?: { selectedMonomers?: BaseMonomer[] } }) => {
        return (
          !props?.selectedMonomers ||
          !isAntisenseOptionVisible(props?.selectedMonomers)
        );
      },
      separator: isAntisenseBlockVisible,
    },
    {
      name: SequenceItemContextMenuNames.modifyAminoAcids,
      title: 'Modify amino acids',
      disabled: false,
      hidden: !modifyAminoAcidsMenuItems.length,
      subMenuItems: modifyAminoAcidsMenuItems,
    },
    {
      name: 'layout_circular',
      title: 'Arrange as a Ring',
      disabled: cyclicStructureFormationDisabled,
    },
    {
      name: 'edit_attachment_points',
      title: 'Edit Attachment Points...',
      disabled: ({
        props,
      }: {
        props?: {
          polymerBondRenderer?: unknown;
          selectedMonomers?: BaseMonomer[];
        };
      }) => !isBondContext(props),
      separator: true,
    },
    {
      name: 'delete',
      title: 'Delete',
      icon: <Icon name={'deleteMenu' as IconName} />,
      disabled: ({ props = {} }) => isCanvasContext(props),
    },
  ];

  const handleMenuChange = ({ id: menuItemId, props }: ItemParams) => {
    switch (true) {
      case menuItemId === 'layout_circular':
        editor?.events.layoutCircular.dispatch();
        hideAll();
        break;
      case menuItemId === 'copy':
        editor?.events.copySelectedStructure.dispatch();
        break;
      case menuItemId === 'create_antisense_rna_chain':
        editor?.events.createAntisenseChain.dispatch(false);
        break;
      case menuItemId === 'create_antisense_dna_chain':
        editor?.events.createAntisenseChain.dispatch(true);
        break;
      case menuItemId === 'delete':
        editor?.events.deleteSelectedStructure.dispatch();
        break;
      case menuItemId === 'paste':
        editor?.events.pasteFromClipboard.dispatch();
        break;
      case menuItemId === 'edit_attachment_points': {
        const polymerBond = props?.polymerBondRenderer?.polymerBond;
        if (!polymerBond) return;

        editor?.events.openMonomerConnectionModal.dispatch({
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
        editor?.events.modifyAminoAcids.dispatch({
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
