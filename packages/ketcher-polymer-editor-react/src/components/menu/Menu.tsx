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
import styled from '@emotion/styled'
import React from 'react'
import { MenuItem } from './menuItem'
import { SubMenu } from './subMenu'
import { IMenuContext, MenuContext } from '../../contexts'

const Divider = styled.span`
  display: block;
  height: 8px;
  width: 32px;
  border-top: 1px solid;
  border-color: ${({ theme }) => theme.ketcher.color.divider};
`

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  background-color: ${({ theme }) => theme.ketcher.color.background.primary};
  border-radius: 2px;
  width: 32px;
  margin-bottom: 8px;

  > * {
    margin-bottom: 8px;
  }

  > :last-child {
    margin-bottom: 0;
  }
`

interface GroupProps {
  divider?: boolean
}

const Group = ({
  children,
  divider = false
}: React.PropsWithChildren<GroupProps>) => {
  const subComponents = React.Children.map(
    children as JSX.Element[],
    (child) => {
      return child?.type === MenuItem || SubMenu ? child : null
    }
  )

  return (
    <>
      {subComponents && (
        <StyledGroup>{subComponents.map((component) => component)}</StyledGroup>
      )}
      {divider && <Divider />}
    </>
  )
}

type MenuProps = {
  onItemClick: (itemKey: string) => void
  activeMenuItem?: string
}

const Menu = ({
  children,
  onItemClick,
  activeMenuItem
}: React.PropsWithChildren<MenuProps>) => {
  const context = React.useMemo<IMenuContext>(
    () => ({
      isActive: (itemKey) => activeMenuItem === itemKey,
      activate: (itemKey) => {
        onItemClick(itemKey)
      }
    }),
    [activeMenuItem, onItemClick]
  )

  const subComponents = React.Children.map(
    children as JSX.Element[],
    (child) => {
      return child?.type === Group ? child : null
    }
  )

  return (
    <MenuContext.Provider value={context}>
      {subComponents.map((component) => component)}
    </MenuContext.Provider>
  )
}

Menu.Group = Group
Menu.Item = MenuItem
Menu.Submenu = SubMenu

export { Menu, MenuContext }
