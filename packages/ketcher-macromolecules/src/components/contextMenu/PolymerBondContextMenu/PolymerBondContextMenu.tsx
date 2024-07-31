import { ItemParams } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { PolymerBondRenderer } from 'ketcher-core';
import { ContextMenu } from 'components/contextMenu/ContextMenu';

export const PolymerBondContextMenu = () => {
  const editor = useAppSelector(selectEditor);

  const menuItems = [
    {
      name: 'edit_connection_points',
      title: 'Edit Connection Points...',
      disabled: false,
      hidden: ({
        props,
      }: {
        props?: { polymerBondRenderer?: PolymerBondRenderer };
      }) => {
        return !props?.polymerBondRenderer;
      },
    },
  ];

  const handleMenuChange = ({ id, props }: ItemParams) => {
    switch (id) {
      case 'edit_connection_points': {
        const polymerBond = props.polymerBondRenderer.polymerBond;

        editor.events.openMonomerConnectionModal.dispatch({
          firstMonomer: polymerBond.firstMonomer,
          secondMonomer: polymerBond.secondMonomer,
          polymerBond,
          isReconnectionDialog: true,
        });
        editor.events.startNewSequence.dispatch(props.sequenceItemRenderer);
        break;
      }
      default:
        break;
    }
  };

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );

  return ketcherEditorRootElement
    ? createPortal(
        <ContextMenu
          id={CONTEXT_MENU_ID.FOR_POLYMER_BOND}
          handleMenuChange={handleMenuChange}
          menuItems={menuItems}
        ></ContextMenu>,
        ketcherEditorRootElement,
      )
    : null;
};
