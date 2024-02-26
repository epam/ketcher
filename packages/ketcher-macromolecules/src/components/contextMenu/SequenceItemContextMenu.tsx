import { Item, ItemParams } from 'react-contexify';
import { ReactElement } from 'react';
import { CONTEXT_MENU_ID } from './types';
import { StyledMenu } from './styles';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';

export const SequenceItemContextMenu = () => {
  const editor = useAppSelector(selectEditor);

  const menuItems = [{ name: 'edit_sequence', title: 'Edit sequence' }];

  const handleMenuChange = ({ id, props }: ItemParams) => {
    switch (id) {
      case 'edit_sequence':
        editor.events.editSequence.dispatch(props.sequenceItemRenderer);
        break;
      default:
        break;
    }
  };

  const assembleMenuItems = () => {
    const items: ReactElement[] = [];
    menuItems.forEach(({ name, title }) => {
      const item = (
        <Item
          id={name}
          onClick={handleMenuChange}
          key={name}
          data-testid={name}
        >
          <span>{title}</span>
        </Item>
      );
      items.push(item);
    });
    return items;
  };

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );

  return ketcherEditorRootElement
    ? createPortal(
        <StyledMenu id={CONTEXT_MENU_ID.FOR_SEQUENCE}>
          {assembleMenuItems()}
        </StyledMenu>,
        ketcherEditorRootElement,
      )
    : null;
};
