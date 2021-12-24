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
import { MenuItem } from './menuItem/MenuItem'
import { FC } from 'react'
import { MenuItemType } from 'components/menu/menu.types'
import styled from '@emotion/styled'
import { Divider } from 'components/menu/menuDivider/Divider'

const Group: FC<{ items: MenuItemType[]; className?: string }> = ({
  items,
  className
}) => {
  return (
    <div className={className}>
      {items.map((item) => {
        return (
          <MenuItem name={item.name} options={item.options} key={item.name} />
        )
      })}
    </div>
  )
}

const StyledGroup = styled(Group)`
  width: 32px;
  border-radius: 2px;
  background-color: white;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 8px;
`

const Menu = () => {
  return (
    <div>
      <StyledGroup
        items={[{ name: 'open', options: ['open', 'open', 'open'] }]}
      />
      <Divider />
      <StyledGroup items={[{ name: 'undo' }]} />
      <StyledGroup
        items={[
          { name: 'erase', options: ['erase', 'erase', 'erase'] },
          { name: 'select', options: ['select', 'select', 'select'] },
          { name: 'rectangle', options: ['rectangle', 'rectangle'] },
          { name: 'arom' }
        ]}
      />
      <StyledGroup
        items={[{ name: 'single', options: ['single', 'single', 'single'] }]}
      />
      <StyledGroup
        items={[
          { name: 'bracket', options: ['bracket', 'bracket', 'bracket'] }
        ]}
      />
      <Divider />
      <StyledGroup items={[{ name: 'settings' }, { name: 'help' }]} />
    </div>
  )
}

const StyledMenu = styled(Menu)`
  position: absolute;
  width: 32px;
  right: 0;
`

export { StyledMenu as Menu }
