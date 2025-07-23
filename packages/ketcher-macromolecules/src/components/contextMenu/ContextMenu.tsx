/* eslint-disable @typescript-eslint/no-use-before-define */
import { ReactElement, useEffect } from 'react';
import { Item, ItemParams, Separator, Submenu } from 'react-contexify';
import {
  BaseMonomer,
  BaseSequenceItemRenderer,
  DeprecatedFlexModeOrSnakeModePolymerBondRenderer,
} from 'ketcher-core';
import { StyledMenu } from 'components/contextMenu/styles';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';
import { useAppDispatch } from 'hooks';
import { setContextMenuActive } from 'state/common';

interface MenuItem {
  name: string;
  title?: string;
  separator?: boolean;
  icon?: ReactElement;
  disabled?:
    | boolean
    | (({
        props,
      }: {
        props?: {
          polymerBondRenderer?: DeprecatedFlexModeOrSnakeModePolymerBondRenderer;
          sequenceItemRenderer?: BaseSequenceItemRenderer;
          selectedMonomers?: BaseMonomer[];
        };
      }) => boolean);
  hidden?:
    | boolean
    | (({
        props,
      }: {
        props?: {
          polymerBondRenderer?: DeprecatedFlexModeOrSnakeModePolymerBondRenderer;
          sequenceItemRenderer?: BaseSequenceItemRenderer;
          selectedMonomers?: BaseMonomer[];
        };
      }) => boolean);
  isMenuTitle?: boolean;
  subMenuItems?: MenuItem[];
  onMouseOver?: (itemId: string) => void;
  onMouseOut?: (itemId: string) => void;
}

type MenuItemGroup = MenuItem[];

interface MenuProps {
  id: CONTEXT_MENU_ID;
  menuItems: Array<MenuItem | MenuItemGroup>;
  handleMenuChange: (params: ItemParams) => void;
}

const isMenuItemGroup = (
  menuItemOrGroup: MenuItem | MenuItemGroup,
): menuItemOrGroup is MenuItemGroup => {
  return Array.isArray(menuItemOrGroup);
};

const assembleMenuItem = (
  {
    name,
    title,
    icon,
    hidden,
    disabled,
    isMenuTitle,
    subMenuItems,
    onMouseOver,
    onMouseOut,
  }: MenuItem,
  handleMenuChange: (params: ItemParams) => void,
) => {
  const MENU_CLOSING_TIME = 500;
  let isMouseOverThrottling = false;

  return subMenuItems && subMenuItems.length ? (
    <Submenu label={title} data-testid={name} key={name}>
      {assembleMenuItems(subMenuItems, handleMenuChange)}
    </Submenu>
  ) : (
    <Item
      id={name}
      onClick={(params) => {
        isMouseOverThrottling = true;
        setTimeout(() => {
          isMouseOverThrottling = false;
        }, MENU_CLOSING_TIME);
        handleMenuChange(params);
      }}
      key={name}
      data-testid={name}
      hidden={hidden}
      disabled={disabled}
      className={isMenuTitle ? 'contexify_item-title' : ''}
      onMouseOver={() => {
        if (isMouseOverThrottling) {
          return;
        }
        onMouseOver?.(name);
      }}
      onMouseOut={() => onMouseOut?.(name)}
    >
      {icon && <span className="context_menu-icon">{icon}</span>}
      <span className="context_menu-text">{title}</span>
    </Item>
  );
};

const assembleMenuItems = (
  menuItems: Array<MenuItem | MenuItemGroup>,
  handleMenuChange: (params: ItemParams) => void,
) => {
  return menuItems.map((menuItemOrGroup, menuItemOrGroupIndex) => {
    return isMenuItemGroup(menuItemOrGroup) ? (
      <>
        {menuItemOrGroupIndex !== 0 &&
          menuItemOrGroup.every((item) =>
            typeof item.hidden === 'function'
              ? item.hidden({ props: {} }) // TODO : pass actual props
              : item.hidden,
          ) && <Separator key={menuItemOrGroupIndex} />}
        {menuItemOrGroup.map((item) =>
          assembleMenuItem(item, handleMenuChange),
        )}
      </>
    ) : (
      <>
        {assembleMenuItem(menuItemOrGroup, handleMenuChange)}
        {menuItemOrGroup.separator && <Separator key={menuItemOrGroupIndex} />}
      </>
    );
  });
};

export const ContextMenu = ({ id, handleMenuChange, menuItems }: MenuProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleContextMenuClose = (e) => {
      const isClickOnNucleotide =
        e.target?.__data__?.node || e.target?.__data__?.monomer;
      if (isClickOnNucleotide) {
        e.stopPropagation();
        return;
      }
      dispatch(setContextMenuActive(false));
    };
    document.addEventListener('click', handleContextMenuClose);
    document.addEventListener('contextmenu', handleContextMenuClose);
    return () => {
      document.removeEventListener('click', handleContextMenuClose);
      document.removeEventListener('contextmenu', handleContextMenuClose);
    };
  }, [dispatch, id]);

  return (
    <StyledMenu id={id}>
      {assembleMenuItems(menuItems, handleMenuChange)}
    </StyledMenu>
  );
};
