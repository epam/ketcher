import { ReactElement, useEffect } from 'react';
import {
  contextMenu,
  Item,
  ItemParams,
  Separator,
  Submenu,
} from 'react-contexify';
import {
  BaseMonomer,
  BaseSequenceItemRenderer,
  DeprecatedFlexModeOrSnakeModePolymerBondRenderer,
} from 'ketcher-core';
import { StyledMenu } from 'components/contextMenu/styles';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectIsContextMenuActive, setContextMenuActive } from 'state/common';

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
    ({
      name,
      title,
      icon,
      hidden,
      disabled,
      isMenuTitle,
      separator,
      subMenuItems,
      onMouseOver,
      onMouseOut,
    }) => {
      const item = subMenuItems?.length ? (
        <Submenu label={title} data-testid={name} key={name}>
          {assembleMenuItems(subMenuItems, handleMenuChange) as never}
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
          {icon && (
            <span className="context_menu-icon">{icon as React.ReactNode}</span>
          )}
          <span
            className={
              name === 'delete'
                ? 'context_menu-delete-text'
                : 'context_menu-text'
            }
          >
            {title}
          </span>
        </Item>
      );
      items.push(item);
      if (separator) {
        items.push(<Separator key={`separator-${name}`} />);
      }
    },
  );
  return items;
};

export const ContextMenu = ({ id, handleMenuChange, menuItems }: MenuProps) => {
  const dispatch = useAppDispatch();
  const isContextMenuActive = useAppSelector(selectIsContextMenuActive);

  useEffect(() => {
    // Prevent menu from closing when clicking inside it
    // This runs in capture phase BEFORE react-contexify's listener
    const preventCloseOnMenuClick = (e: MouseEvent) => {
      const clickedElement = e.target;
      // Type guard: ensure target is an Element
      if (!(clickedElement instanceof Element)) return;

      const isClickInsideMenu = clickedElement.closest('.contexify');
      // Only stop propagation if NOT clicking on an actual menu item
      // Allow clicks on contexify_item to work normally
      const isClickOnMenuItem = clickedElement.closest('.contexify_item');

      if (isClickInsideMenu && !isClickOnMenuItem) {
        // Clicking on padding, separator, or menu container itself
        e.stopPropagation();
      }
    };

    const handleContextMenuClose = (e: MouseEvent) => {
      const isClickOnNucleotide =
        e.target?.__data__?.node || e.target?.__data__?.monomer;
      if (isClickOnNucleotide) {
        e.stopPropagation();
        return;
      }
      dispatch(setContextMenuActive(false));
    };

    // Add listener in capture phase (runs before react-contexify's listeners)
    document.addEventListener('click', preventCloseOnMenuClick, true);
    document.addEventListener('mousedown', preventCloseOnMenuClick, true);

    document.addEventListener('click', handleContextMenuClose);
    document.addEventListener('contextmenu', handleContextMenuClose);

    return () => {
      document.removeEventListener('click', preventCloseOnMenuClick, true);
      document.removeEventListener('mousedown', preventCloseOnMenuClick, true);
      document.removeEventListener('click', handleContextMenuClose);
      document.removeEventListener('contextmenu', handleContextMenuClose);
    };
  }, [dispatch]);

  useEffect(() => {
    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isContextMenuActive) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      contextMenu.hideAll();
      dispatch(setContextMenuActive(false));
    };

    document.addEventListener('keydown', handleEscapeKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleEscapeKeyDown, true);
    };
  }, [dispatch, isContextMenuActive]);

  return (
    <StyledMenu id={id}>
      {assembleMenuItems(menuItems, handleMenuChange) as never}
    </StyledMenu>
  );
};
