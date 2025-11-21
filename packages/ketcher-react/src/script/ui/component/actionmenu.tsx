/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  useRef,
  type MouseEvent,
  type KeyboardEvent,
  type CSSProperties,
  type ReactNode,
} from 'react';

import action from '../action';
import clsx from 'clsx';
import { hiddenAncestor } from '../state/toolbar';
import { shortcutStr } from 'ketcher-core';
import { Icon } from 'components';
import type { UiAction } from '../action/action.types';

interface ActionStatus {
  disabled?: boolean;
  selected?: boolean;
  hidden?: boolean;
}

// eslint-disable-next-line no-use-before-define
type MenuItemOrString = string | MenuItemType;

type MenuItemType = {
  id: string;
  menu?: MenuItemOrString[];
  // eslint-disable-next-line no-use-before-define
  component?: (props: ActionMenuPropsType) => ReactNode;
};

type ActionMenuPropsType = {
  name: string;
  menu: MenuItemOrString[];
  className?: string;
  role?: string;
  status: Record<string, ActionStatus>;
  opened?: string | null;
  onOpen: (menuName?: string, isSelected?: boolean) => void;
  visibleTools: Record<string, string>;
  onAction: (action: unknown) => void;
  disableableButtons: string[];
  indigoVerification: boolean;
};

interface ActionButtonProps {
  name: string;
  action: UiAction;
  status?: ActionStatus;
  onAction: (action: unknown) => void;
  disableableButtons: string[];
  indigoVerification: boolean;
}

function isMenuOpened(currentNode: HTMLElement | null): boolean {
  const parentNode = hiddenAncestor(currentNode);
  return parentNode?.classList.contains('opened') || false;
}

export function showMenuOrButton(
  action: Record<string, UiAction>,
  item: string | MenuItemType,
  status: ActionStatus,
  props: ActionMenuPropsType,
): ReactNode {
  if (typeof item !== 'object') {
    return (
      <ActionButton
        {...props}
        name={item}
        action={action[item]}
        status={status}
      />
    );
  }
  if (item.menu) {
    return <ActionMenu {...props} name={item.id} menu={item.menu} />;
  }
  return item.component?.(props);
}

function ActionButton({
  name,
  action,
  status = {},
  onAction,
  disableableButtons,
  indigoVerification,
}: ActionButtonProps): JSX.Element {
  const shortcut = action.shortcut && shortcutStr(action.shortcut);
  const menuRef = useRef<HTMLButtonElement>(null);
  const disabled =
    status.disabled ||
    (indigoVerification && disableableButtons.includes(name));

  const onClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (!status.selected || isMenuOpened(menuRef.current)) {
      onAction(action.action);
      event.stopPropagation();
    }
  };

  return (
    <button
      ref={menuRef}
      disabled={disabled}
      onClick={onClick}
      title={shortcut ? `${action.title} (${shortcut})` : action.title}
    >
      <Icon name={name} />
      <kbd>{shortcut}</kbd>
    </button>
  );
}

function findActiveMenuItem(
  menuItems: MenuItemOrString[],
  status: Record<string, ActionStatus>,
): string | null {
  let activeMenuItem: string | null = null;
  for (const current of menuItems) {
    const itemKey = typeof current === 'string' ? current : current.id;
    if (status[itemKey]?.selected) {
      activeMenuItem = itemKey;
      break;
    }
  }
  return activeMenuItem;
}

function isLeaf(menu: MenuItemOrString[]): boolean {
  return menu.every((item) => typeof item === 'string');
}

function isOpened(item: MenuItemType, opened?: string | null): boolean {
  return item.id === opened;
}

function renderActiveMenuItem(
  item: MenuItemType,
  props: ActionMenuPropsType,
): ReactNode {
  const menu = item.menu || [];
  const { opened, status, ...attrs } = props;
  let activeMenuItem: string | null = null;
  if (isOpened(item, opened)) {
    if (isLeaf(menu)) {
      activeMenuItem = findActiveMenuItem(menu, status) || (menu[0] as string);
    } else {
      const subMenuItems = menu.reduce<string[]>((acc, curr) => {
        if (typeof curr !== 'string' && curr.menu) {
          acc.push(
            ...(curr.menu.filter(
              (item) => typeof item === 'string',
            ) as string[]),
          );
        }
        return acc;
      }, []);

      activeMenuItem =
        findActiveMenuItem(subMenuItems, status) || subMenuItems[0];
    }
  }

  return (
    activeMenuItem && (
      <ActionButton
        {...props}
        {...attrs}
        name={activeMenuItem}
        action={action[activeMenuItem]}
        status={status[activeMenuItem]}
      />
    )
  );
}

function ActionMenu({
  name,
  menu,
  className,
  role,
  ...props
}: ActionMenuPropsType): JSX.Element {
  const visibleMenu = menu.reduce<MenuItemOrString[]>((items, item) => {
    const itemKey = typeof item === 'string' ? item : item.id;
    const status = props.status[itemKey];
    if (!status?.hidden) {
      items.push(item);
    }

    return items;
  }, []);

  const handleMenuItemClick = (event: MouseEvent<HTMLLIElement>): void =>
    openHandle(event, props.onOpen);
  const handleMenuItemKeyDown = (event: KeyboardEvent<HTMLLIElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openHandle(event, props.onOpen);
    }
  };

  return (
    <menu
      className={className}
      role={role || 'menu'}
      style={toolMargin(name, menu, props.visibleTools)}
    >
      {visibleMenu.map((item) => {
        const itemId = typeof item === 'string' ? item : item.id;
        const itemObj = typeof item === 'string' ? null : item;
        return (
          <li
            key={itemId}
            id={itemId}
            className={clsx(props.status[itemId], {
              opened: itemObj && itemObj.id === props.opened,
            })}
            onClick={handleMenuItemClick}
            onKeyDown={handleMenuItemKeyDown}
            role="menuitem"
            tabIndex={0}
          >
            {showMenuOrButton(action, item, props.status[itemId], props)}
            {itemObj?.menu &&
              props.opened &&
              renderActiveMenuItem(itemObj, props)}
            {itemObj?.menu && <Icon name="dropdown" />}
          </li>
        );
      })}
    </menu>
  );
}

function toolMargin(
  menuName: string,
  menu: MenuItemOrString[],
  visibleTools: Record<string, string>,
): CSSProperties {
  if (!visibleTools[menuName]) return {};
  // now not found better way
  const iconHeight =
    window.innerHeight <= 600 || window.innerWidth <= 1040 ? 32 : 40;
  let index = menu.indexOf(visibleTools[menuName]); // first level

  if (index === -1) {
    let tools: MenuItemOrString[] = [];
    menu.forEach((item) => {
      if (typeof item !== 'string' && item.menu) {
        tools = tools.concat(item.menu);
      }
    });

    index = tools.indexOf(visibleTools[menuName]); // second level. example: `bond: bond-any`
  }

  return index !== -1 ? { marginTop: -(iconHeight * index) + 'px' } : {};
}

function openHandle(
  event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>,
  onOpen: (menuName?: string, isSelected?: boolean) => void,
): void {
  const hiddenEl = hiddenAncestor(event.currentTarget);
  const isSelected = event.currentTarget?.classList.contains('selected');

  onOpen(hiddenEl?.id, isSelected);
  event.stopPropagation();
}

export default ActionMenu;
