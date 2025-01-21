import { ItemParams } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import {
  BaseMonomer,
  getRnaBaseFromSugar,
  getSugarFromRnaBase,
  isRnaBaseOrAmbiguousRnaBase,
  RNABase,
  Sugar,
} from 'ketcher-core';
import { ContextMenu } from 'components/contextMenu/ContextMenu';

type SelectedMonomersContextMenuType = {
  selectedMonomers: BaseMonomer[];
};

export const SelectedMonomersContextMenu = ({
  selectedMonomers,
}: SelectedMonomersContextMenuType) => {
  const editor = useAppSelector(selectEditor);
  const isAntisenseCreationDisabled = selectedMonomers?.some(
    (selectedMonomer) => {
      return (
        (isRnaBaseOrAmbiguousRnaBase(selectedMonomer) &&
          selectedMonomer.monomerItem.props.MonomerNaturalAnalogCode === '') ||
        (selectedMonomer instanceof RNABase &&
          (selectedMonomer.monomerItem.props.MonomerNaturalAnalogCode === 'X' ||
            selectedMonomer.hydrogenBonds.length > 0 ||
            selectedMonomer.covalentBonds.length > 1)) ||
        (selectedMonomer instanceof Sugar &&
          (getRnaBaseFromSugar(selectedMonomer)?.hydrogenBonds.length || 0) > 0)
      );
    },
  );

  const menuItems = [
    {
      name: 'copy',
      title: 'Copy',
    },
    {
      name: 'create_antisense_chain',
      title: 'Create Antisense Strand',
      separator: true,
      disabled: isAntisenseCreationDisabled,
      hidden: ({ props }: { props?: { selectedMonomers?: BaseMonomer[] } }) => {
        return !props?.selectedMonomers?.some((selectedMonomer) => {
          return (
            (selectedMonomer instanceof RNABase &&
              getSugarFromRnaBase(selectedMonomer)) ||
            (selectedMonomer instanceof Sugar &&
              getRnaBaseFromSugar(selectedMonomer))
          );
        });
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
      case 'create_antisense_chain':
        editor.events.createAntisenseChain.dispatch();
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
