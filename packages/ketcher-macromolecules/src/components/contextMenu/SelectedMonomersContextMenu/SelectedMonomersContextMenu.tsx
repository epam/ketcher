import { ItemParams } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { BaseSequenceItemRenderer } from 'ketcher-core';
import { ContextMenu } from 'components/contextMenu/ContextMenu';

type SelectedMonomersContextMenuType = {};

export const SelectedMonomersContextMenu =
  ({}: SelectedMonomersContextMenuType) => {
    const editor = useAppSelector(selectEditor);
    const dispatch = useAppDispatch();

    const menuItems = [
      {
        name: 'create_antisense_strand',
        title: 'Create Antisense Strand',
        disabled: false,
        hidden: ({
          props,
        }: {
          props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
        }) => {
          return false;
        },
      },
    ];

    const handleMenuChange = ({ id, props }: ItemParams) => {
      editor.events.createAntisenseStrand.dispatch();
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
