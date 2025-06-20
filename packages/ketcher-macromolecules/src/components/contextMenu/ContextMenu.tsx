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

interface MenuProps {
  id: CONTEXT_MENU_ID;
  menuItems: MenuItem[];
  handleMenuChange: (params: ItemParams) => void;
}

const assembleMenuItems = (
  menuItems: MenuItem[],
  handleMenuChange: (params: ItemParams) => void,
) => {
  const MENU_CLOSING_TIME = 500;
  let isMouseOverThrottling = false;
  const items: ReactElement[] = [];

  menuItems.forEach(
    (
      {
        name,
        title,
        hidden,
        disabled,
        isMenuTitle,
        separator,
        subMenuItems,
        onMouseOver,
        onMouseOut,
      },
      index,
    ) => {
      const item =
        subMenuItems && subMenuItems.length ? (
          <Submenu label={title} data-testid={name}>
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
