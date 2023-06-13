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

import { useRef } from 'react'

import action from '../action'
import clsx from 'clsx'
import { hiddenAncestor } from '../state/toolbar'
import { shortcutStr } from '../views/toolbars/shortcutStr'
import { Icon } from 'src/components'

function isMenuOpened(currentNode) {
  const parentNode = hiddenAncestor(currentNode)
  return parentNode && parentNode.classList.contains('opened')
}

export function showMenuOrButton(action, item, status, props) {
  // eslint-disable-line no-shadow
  if (typeof item !== 'object') {
    return (
      <ActionButton
        {...props}
        name={item}
        action={action[item]}
        status={status}
      />
    )
  }
  if (item.menu) {
    return <ActionMenu {...props} name={item.id} menu={item.menu} />
  }
  return item.component(props)
}

function ActionButton({
  name,
  action,
  status = {},
  onAction,
  disableableButtons,
  indigoVerification
}) {
  // eslint-disable-line no-shadow
  const shortcut = action.shortcut && shortcutStr(action.shortcut)
  const menuRef = useRef(null)
  const disabled =
    status.disabled || (indigoVerification && disableableButtons.includes(name))

  const onClick = (event) => {
    if (!status.selected || isMenuOpened(menuRef.current)) {
      onAction(action.action)
      event.stopPropagation()
    }
  }

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
  )
}

function findActiveMenuItem(menuItems, status) {
  let activeMenuItem = null
  for (let index = 0; index < menuItems.length; index++) {
    const current = menuItems[index]
    if (status[current]?.selected) {
      activeMenuItem = current
      break
    }
  }
  return activeMenuItem
}

function isLeaf(menu) {
  return menu.every((item) => typeof item === 'string')
}

function isOpened(item, opened) {
  return item.id === opened
}

function renderActiveMenuItem(item, props) {
  const menu = item.menu || []
  const { opened, status, ...attrs } = props
  let activeMenuItem = null
  if (isOpened(item, opened)) {
    if (isLeaf(menu)) {
      activeMenuItem = findActiveMenuItem(menu, status) || menu[0]
    } else {
      const subMenuItems = menu.reduce((acc, curr) => {
        acc.push(...curr.menu)
        return acc
      }, [])

      activeMenuItem =
        findActiveMenuItem(subMenuItems, status) || subMenuItems[0]
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
  )
}

function ActionMenu({ name, menu, className, role, ...props }) {
  const visibleMenu = menu.reduce((items, item) => {
    const status = props.status[item]
    if (!status || !status.hidden) {
      items.push(item)
    }

    return items
  }, [])

  return (
    <menu
      className={className}
      role={role}
      style={toolMargin(name, menu, props.visibleTools)}
    >
      {visibleMenu.map((item) => (
        <li
          key={item.id || item}
          id={item.id || item}
          className={clsx(props.status[item], {
            opened: item.id === props.opened
          })}
          onClick={(ev) => openHandle(ev, props.onOpen)}
        >
          {showMenuOrButton(action, item, props.status[item], props)}
          {item.menu && props.opened && renderActiveMenuItem(item, props)}
          {item.menu && <Icon name="dropdown" />}
        </li>
      ))}
    </menu>
  )
}

function toolMargin(menuName, menu, visibleTools) {
  if (!visibleTools[menuName]) return {}
  // now not found better way
  const iconHeight =
    window.innerHeight <= 600 || window.innerWidth <= 1040 ? 32 : 40
  let index = menu.indexOf(visibleTools[menuName]) // first level

  if (index === -1) {
    let tools = []
    menu.forEach((item) => {
      tools = tools.concat(item.menu)
    })

    index = tools.indexOf(visibleTools[menuName]) // second level. example: `bond: bond-any`
  }

  return index !== -1 ? { marginTop: -(iconHeight * index) + 'px' } : {}
}

function openHandle(event, onOpen) {
  const hiddenEl = hiddenAncestor(event.currentTarget)
  const isSelected = event.currentTarget?.classList.contains('selected')

  onOpen(hiddenEl && hiddenEl.id, isSelected)
  event.stopPropagation()
}

export default ActionMenu
