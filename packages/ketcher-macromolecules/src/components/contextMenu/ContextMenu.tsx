import { ReactElement } from 'react';
import { Item, ItemParams } from 'react-contexify';
import { BaseSequenceItemRenderer, PolymerBondRenderer } from 'ketcher-core';
import { StyledMenu } from 'components/contextMenu/styles';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';

interface MenuItem {
  name: string;
  title?: string;
  separator?: boolean;
  disabled?: boolean;
  hidden?: ({
    props,
  }: {
    props?: {
      sequenceItemRenderer?: BaseSequenceItemRenderer;
      polymerBondRenderer?: PolymerBondRenderer;
    };
  }) => boolean;
  isMenuTitle?: boolean;
}

interface MenuProps {
  id: CONTEXT_MENU_ID;
  menuItems: MenuItem[];
  handleMenuChange: (params: ItemParams) => void;
}

const assembleMenuItems = (
  menuItems: MenuItem[],
  handleMenuChange: (params: ItemParams) => void,
) => {
  const items: ReactElement[] = [];

  menuItems.forEach(({ name, title, hidden, disabled, isMenuTitle }) => {
    const item = (
      <Item
        id={name}
        onClick={handleMenuChange}
        key={name}
        data-testid={name}
        hidden={hidden}
        disabled={disabled}
        className={isMenuTitle ? 'contexify_item-title' : ''}
      >
        <span>{title}</span>
      </Item>
    );
    items.push(item);
  });
  return items;
};

export const ContextMenu = ({ id, handleMenuChange, menuItems }: MenuProps) => {
  return (
    <StyledMenu id={id}>
      {assembleMenuItems(menuItems, handleMenuChange)}
    </StyledMenu>
  );
};
