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
import styled from '@emotion/styled'
import { Divider } from 'components/menu/menuDivider/Divider'
import { MenuItemVariant } from 'components/menu/menu.types'
import { Box } from '@mui/material'

interface groupItem {
  name: MenuItemVariant
  options?: MenuItemVariant[]
  vertical?: boolean
}

const Group: FC<{ items: groupItem[] }> = ({ items }) => {
  return (
    <div>
      {items.map((item) => {
        return (
          <MenuItem
            key={item.name}
            name={item.name}
            options={item.options}
            vertical={item.vertical}
          />
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
    <StyledBox>
      <StyledGroup
        items={[
          {
            name: 'open'
          }
        ]}
      />
      <Divider />
      <StyledGroup items={[{ name: 'undo' }]} />
      <StyledGroup
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
      <StyledGroup
        items={[
          {
            name: 'bonds',
            options: ['single-bond', 'double-bond', 'triple-bond']
          }
        ]}
      />
      <StyledGroup items={[{ name: 'bracket' }]} />
      <Divider />
      <StyledGroup items={[{ name: 'settings' }, { name: 'help' }]} />
    </StyledBox>
  )
}

const StyledBox = styled(Box)`
  width: 32px;
`

export { Menu }
