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
import { MenuItem } from './menuItem'
import styled from '@emotion/styled'
import { Divider } from 'components/menu/menuDivider'
import { MenuItemVariant } from 'components/menu/menu.types'

interface groupItem {
  name: MenuItemVariant
  options?: MenuItemVariant[]
  vertical?: boolean
}

const Group = ({ items }) => {
  const GroupContainer = styled('div')`
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    background-color: ${(props) => props.theme.color.background.primary};
    border-radius: 2px;

    > * {
      margin-bottom: 8px;
    }

    > :last-child {
      margin-bottom: 0;
    }
  `
  return (
    <GroupContainer>
      {items.map((item: groupItem) => {
        return (
          <MenuItem
            key={item.name}
            name={item.name}
            options={item.options}
            vertical={item.vertical}
          />
        )
      })}
    </GroupContainer>
  )
}

const MenuComponent = styled('div')`
  width: 32px;
  > * {
    margin-bottom: 8px;
  }
`

const Menu = () => {
  return (
    <MenuComponent>
      <Group
        items={[
          {
            name: 'open'
          }
        ]}
      />
      <Divider />
      <Group items={[{ name: 'undo' }]} />
      <Group
        items={[
          { name: 'erase' },
          {
            name: 'select',
            options: ['select-lasso', 'select-rectangle', 'select-fragment'],
            vertical: true
          },
          { name: 'shapes', options: ['rectangle', 'ellipse'] },
          { name: 'redo' }
        ]}
      />
      <Group
        items={[
          {
            name: 'bonds',
            options: ['single-bond', 'double-bond', 'triple-bond']
          }
        ]}
      />
      <Group items={[{ name: 'bracket' }]} />
      <Divider />
      <Group items={[{ name: 'settings' }, { name: 'help' }]} />
    </MenuComponent>
  )
}

export { Menu }
