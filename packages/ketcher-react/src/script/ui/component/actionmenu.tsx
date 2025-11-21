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

import React, { useRef } from 'react';

import action from '../action';
import clsx from 'clsx';
import { hiddenAncestor } from '../state/toolbar';
import { shortcutStr } from 'ketcher-core';
import { Icon } from 'components';
import { IconName } from 'components/Icon/types';
import { Tools, UiAction, UiActionAction } from '../action';

interface ItemStatus {
  selected?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  [key: string]: any;
}

interface StatusMap {
  [key: string]: ItemStatus;
}

interface VisibleToolsMap {
  [key: string]: string;
}

interface MenuItemWithMenu {
  id: string;
  menu: MenuItem[];
}

interface MenuItemWithComponent {
  component: (props: SharedActionProps) => JSX.Element;
}

type MenuItem = string | MenuItemWithMenu | MenuItemWithComponent;

function isMenuItemWithMenu(item: MenuItem): item is MenuItemWithMenu {
  return typeof item === 'object' && 'menu' in item;
}

function isMenuItemWithComponent(
  item: MenuItem,
): item is MenuItemWithComponent {
  return typeof item === 'object' && 'component' in item;
}

interface ActionButtonProps {
  name: IconName;
  action: UiAction;
  status?: ItemStatus;
  onAction: (action: UiActionAction) => void;
  disableableButtons?: string[];
  indigoVerification?: boolean;
}

interface SharedActionProps {
  status: StatusMap;
  onOpen: (id: string | undefined, isSelected: boolean) => void;
  onAction: (action: UiActionAction) => void;
  opened?: string;
  visibleTools: VisibleToolsMap;
  disableableButtons?: string[];
  indigoVerification?: boolean;
}

interface ActionMenuProps extends SharedActionProps {
  name: string;
  menu: MenuItem[];
  className?: string;
  role?: string;
}

function isMenuOpened(currentNode: HTMLElement | null): boolean {
  const parentNode = hiddenAncestor(currentNode);
  return parentNode?.classList.contains('opened') || false;
}

function getItemKey(item: MenuItem): string {
  return typeof item === 'string'
    ? item
    : isMenuItemWithMenu(item)
      ? item.id
      : '';
}

export function showMenuOrButton(
  action: Tools,
  item: MenuItem,
  status: ItemStatus,
  props: SharedActionProps,
): JSX.Element {
  if (typeof item !== 'object') {
    return (
      <ActionButton
        name={item as IconName}
        action={action[item]}
        status={status}
        onAction={props.onAction}
        disableableButtons={props.disableableButtons}
        indigoVerification={props.indigoVerification}
      />
    );
  }
  if (isMenuItemWithMenu(item)) {
    return <ActionMenu {...props} name={item.id} menu={item.menu} />;
  }
  if (isMenuItemWithComponent(item)) {
    return item.component(props);
  }
  return <></>;
}

function ActionButton({
  name,
  action,
  status = {},
  onAction,
  disableableButtons = [],
  indigoVerification,
}: ActionButtonProps) {
  const shortcut = action.shortcut && shortcutStr(action.shortcut);
  const menuRef = useRef<HTMLButtonElement>(null);
  const disabled =
    status.disabled ||
    (indigoVerification && disableableButtons.includes(name));

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
  menuItems: string[],
  status: StatusMap,
): string | null {
  let activeMenuItem: string | null = null;
  for (const current of menuItems) {
    if (status[current]?.selected) {
      activeMenuItem = current;
      break;
    }
  }
  return activeMenuItem;
}

function isLeaf(menu: MenuItem[]): boolean {
  return menu.every((item) => typeof item === 'string');
}

function isOpened(item: MenuItemWithMenu, opened: string | undefined): boolean {
  return item.id === opened;
}

function renderActiveMenuItem(
  item: MenuItemWithMenu,
  props: SharedActionProps,
): JSX.Element | null {
  const menu = item.menu || [];
  const { opened, status } = props;
  let activeMenuItem: string | null = null;
  if (isOpened(item, opened)) {
    if (isLeaf(menu)) {
      activeMenuItem =
        findActiveMenuItem(menu as string[], status) || (menu[0] as string);
    } else {
      const subMenuItems = (menu as MenuItemWithMenu[]).reduce(
        (acc: string[], curr) => {
          acc.push(...(curr.menu as string[]));
          return acc;
        },
        [],
      );

      activeMenuItem =
        findActiveMenuItem(subMenuItems, status) || subMenuItems[0];
    }
  }

  return (
    activeMenuItem && (
      <ActionButton
        name={activeMenuItem as IconName}
        action={action[activeMenuItem]}
        status={status[activeMenuItem]}
        onAction={props.onAction}
        disableableButtons={props.disableableButtons}
        indigoVerification={props.indigoVerification}
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
}: ActionMenuProps) {
  const visibleMenu = menu.reduce((items: MenuItem[], item: MenuItem) => {
    const itemKey = getItemKey(item);
    const status = props.status[itemKey];
    if (!status?.hidden) {
      items.push(item);
    }

    return items;
  }, []);

  const handleMenuItemClick = (event: React.MouseEvent) =>
    openHandle(event, props.onOpen);
  const handleMenuItemKeyDown = (event: React.KeyboardEvent) => {
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
        const itemKey = getItemKey(item);
        const itemId =
          typeof item === 'string'
            ? item
            : isMenuItemWithMenu(item)
              ? item.id
              : undefined;
        return (
          <li
            key={itemKey}
            id={itemId}
            className={clsx(props.status[itemKey], {
              opened: isMenuItemWithMenu(item) && item.id === props.opened,
            })}
            onClick={handleMenuItemClick}
            onKeyDown={handleMenuItemKeyDown}
            role="menuitem"
            tabIndex={0}
          >
            {showMenuOrButton(action, item, props.status[itemKey], props)}
            {isMenuItemWithMenu(item) &&
              props.opened &&
              renderActiveMenuItem(item, props)}
            {isMenuItemWithMenu(item) && <Icon name="dropdown" />}
          </li>
        );
      })}
    </menu>
  );
}

function toolMargin(
  menuName: string,
  menu: MenuItem[],
  visibleTools: VisibleToolsMap,
): React.CSSProperties {
  if (!visibleTools[menuName]) return {};
  // now not found better way
  const iconHeight =
    window.innerHeight <= 600 || window.innerWidth <= 1040 ? 32 : 40;
  let index = (menu as string[]).indexOf(visibleTools[menuName]); // first level

  if (index === -1) {
    let tools: string[] = [];
    menu.forEach((item) => {
      if (isMenuItemWithMenu(item)) {
        tools = tools.concat(item.menu as string[]);
      }
    });

    index = tools.indexOf(visibleTools[menuName]); // second level. example: `bond: bond-any`
  }

  return index !== -1 ? { marginTop: -(iconHeight * index) + 'px' } : {};
}

function openHandle(
  event: React.MouseEvent | React.KeyboardEvent,
  onOpen: (id: string | undefined, isSelected: boolean) => void,
): void {
  const currentTarget = event.currentTarget as HTMLElement;
  const hiddenEl = hiddenAncestor(currentTarget);
  const isSelected = currentTarget?.classList.contains('selected') || false;

  onOpen(hiddenEl?.id, isSelected);
  event.stopPropagation();
}

export default ActionMenu;
