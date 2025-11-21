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

import { useRef } from 'react';

import action from '../action';
import clsx from 'clsx';
import { hiddenAncestor } from '../state/toolbar';
import { shortcutStr } from 'ketcher-core';
import { Icon, IconName } from 'components';
import { Tools, UiAction, UiActionAction } from '../action/action.types';

interface ItemStatus {
  disabled?: boolean;
  selected?: boolean;
  hidden?: boolean;
}

interface StatusMap {
  [key: string]: ItemStatus;
}

interface VisibleTools {
  [key: string]: string;
}

interface MenuItem {
  id: string;
  menu?: Array<string | MenuItem>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: (props: any) => JSX.Element;
}

interface ActionMenuBaseProps {
  status: StatusMap;
  opened?: string | null;
  onOpen: (menuName: string | undefined, isSelected: boolean) => void;
  visibleTools: VisibleTools;
  onAction: (action: UiActionAction) => void;
  disableableButtons?: string[];
  indigoVerification?: boolean;
}

interface ActionMenuProps extends ActionMenuBaseProps {
  name: string;
  menu: Array<string | MenuItem>;
  className?: string;
  role?: string;
}

interface ActionButtonProps {
  name: string;
  action: UiAction;
  status?: ItemStatus;
  onAction: (action: UiActionAction) => void;
  disableableButtons?: string[];
  indigoVerification?: boolean;
}

function isMenuOpened(currentNode: HTMLElement | null): boolean {
  const parentNode = hiddenAncestor(currentNode);
  return parentNode?.classList.contains('opened') || false;
}

export function showMenuOrButton(
  actions: Tools,
  item: string | MenuItem,
  status: ItemStatus,
  props: ActionMenuBaseProps,
): JSX.Element {
  if (typeof item !== 'object') {
    return (
      <ActionButton
        {...props}
        name={item}
        action={actions[item]}
        status={status}
      />
    );
  }
  if (item.menu) {
    return <ActionMenu {...props} name={item.id} menu={item.menu} />;
  }
  if (item.component) {
    return item.component(props);
  }
  return <div />;
}

function ActionButton({
  name,
  action,
  status = {},
  onAction,
  disableableButtons = [],
  indigoVerification = false,
}: ActionButtonProps): JSX.Element {
  const shortcut = action.shortcut && shortcutStr(action.shortcut);
  const menuRef = useRef<HTMLButtonElement>(null);
  const disabled =
    status.disabled ||
    (indigoVerification && disableableButtons.includes(name));

  const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
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
      <Icon name={name as IconName} />
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

function isLeaf(menu: Array<string | MenuItem>): boolean {
  return menu.every((item) => typeof item === 'string');
}

function isOpened(item: MenuItem, opened: string | null | undefined): boolean {
  return item.id === opened;
}

function renderActiveMenuItem(
  item: MenuItem,
  props: ActionMenuBaseProps,
): JSX.Element | null {
  const menu = item.menu || [];
  const { opened, status } = props;
  let activeMenuItem: string | null = null;
  if (isOpened(item, opened)) {
    if (isLeaf(menu)) {
      activeMenuItem =
        findActiveMenuItem(menu as string[], status) || (menu[0] as string);
    } else {
      const subMenuItems = (menu as MenuItem[]).reduce(
        (acc: string[], curr: MenuItem) => {
          acc.push(...(curr.menu as string[]));
          return acc;
        },
        [],
      );

      activeMenuItem =
        findActiveMenuItem(subMenuItems, status) || subMenuItems[0];
    }
  }

  return activeMenuItem ? (
    <ActionButton
      name={activeMenuItem}
      action={action[activeMenuItem]}
      status={status[activeMenuItem]}
      onAction={props.onAction}
      disableableButtons={props.disableableButtons}
      indigoVerification={props.indigoVerification}
    />
  ) : null;
}

function ActionMenu({
  name,
  menu,
  className,
  role,
  ...props
}: ActionMenuProps): JSX.Element {
  const visibleMenu = menu.reduce((items: Array<string | MenuItem>, item) => {
    const itemKey = typeof item === 'string' ? item : item.id;
    const status = props.status[itemKey];
    if (!status?.hidden) {
      items.push(item);
    }

    return items;
  }, []);

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement>,
  ): void => {
    openHandle(event, props.onOpen);
  };

  const handleMenuItemKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
  ): void => {
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
        const itemKey = typeof item === 'string' ? item : item.id;
        const itemObj = typeof item === 'string' ? { id: item } : item;

        return (
          <li
            key={itemKey}
            id={itemKey}
            className={clsx(props.status[itemKey], {
              opened: itemObj.id === props.opened,
            })}
            onClick={handleMenuItemClick}
            onKeyDown={handleMenuItemKeyDown}
            role="menuitem"
            tabIndex={0}
          >
            {showMenuOrButton(action, item, props.status[itemKey], props)}
            {itemObj.id !== itemKey &&
              props.opened &&
              renderActiveMenuItem(itemObj as MenuItem, props)}
            {typeof item !== 'string' && item.menu && <Icon name="dropdown" />}
          </li>
        );
      })}
    </menu>
  );
}

function toolMargin(
  menuName: string,
  menu: Array<string | MenuItem>,
  visibleTools: VisibleTools,
): React.CSSProperties {
  if (!visibleTools[menuName]) return {};
  // now not found better way
  const iconHeight =
    window.innerHeight <= 600 || window.innerWidth <= 1040 ? 32 : 40;
  let index = -1;

  // First level search
  for (let i = 0; i < menu.length; i++) {
    const item = menu[i];
    const itemName = typeof item === 'string' ? item : item.id;
    if (itemName === visibleTools[menuName]) {
      index = i;
      break;
    }
  }

  // Second level search
  if (index === -1) {
    const tools: string[] = [];
    menu.forEach((item) => {
      if (typeof item !== 'string' && item.menu) {
        tools.push(
          ...(item.menu.map((subItem) =>
            typeof subItem === 'string' ? subItem : subItem.id,
          ) as string[]),
        );
      }
    });

    index = tools.indexOf(visibleTools[menuName]);
  }

  return index !== -1 ? { marginTop: -(iconHeight * index) + 'px' } : {};
}

function openHandle(
  event: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>,
  onOpen: (menuName: string | undefined, isSelected: boolean) => void,
): void {
  const hiddenEl = hiddenAncestor(event.currentTarget);
  const isSelected =
    event.currentTarget?.classList.contains('selected') || false;

  onOpen(hiddenEl?.id, isSelected);
  event.stopPropagation();
}

export default ActionMenu;
