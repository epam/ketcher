import { ReactElement } from 'react';
import { Item, ItemParams, Separator } from 'react-contexify';
import {
  BaseSequenceItemRenderer,
  DeprecatedFlexModeOrSnakeModePolymerBondRenderer,
} from 'ketcher-core';
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
      polymerBondRenderer?: DeprecatedFlexModeOrSnakeModePolymerBondRenderer;
      sequenceItemRenderer?: BaseSequenceItemRenderer;
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

  menuItems.forEach(
    ({ name, title, hidden, disabled, isMenuTitle, separator }, index) => {
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
      if (separator) {
        items.push(<Separator key={index} />);
      }
    },
  );
  return items;
};

export const ContextMenu = ({ id, handleMenuChange, menuItems }: MenuProps) => {
  return (
    <StyledMenu id={id}>
      {assembleMenuItems(menuItems, handleMenuChange)}
    </StyledMenu>
  );
};
