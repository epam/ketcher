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
import React, { useContext, useState } from 'react'
import { ClickAwayListener } from '@mui/material'
import styled from '@emotion/styled'
import Collapse from '@mui/material/Collapse'
import { Icon } from 'components/shared/ui/icon'
import { MenuItem } from 'components/menu/menuItem'
import { ContextType, MenuContext } from 'components/menu'

const SubMenuContainer = styled('div')`
  display: flex;
  position: relative;
`

type OptionsFlexContainerProps = {
  isVertical?: boolean
} & React.HTMLAttributes<HTMLDivElement>

const OptionsFlexContainer = styled('div')<OptionsFlexContainerProps>`
  display: flex;
  position: absolute;
  left: 5px;
  border-radius: 2px;
  flex-direction: ${(props) => (props.isVertical ? 'column' : 'row')};
`

type DropDownProps = {
  isActive: boolean
} & React.HTMLAttributes<HTMLDivElement>

const DropDown = styled('div')<DropDownProps>`
  display: flex;
  width: 6px;
  height: 6px;
  position: absolute;
  bottom: 0;
  right: 0;

  > svg path {
    fill: ${(props) =>
      props.isActive
        ? props.theme.color.icon.clicked
        : props.theme.color.icon.activeMenu};
  }
`

const OptionsItemsCollapse = styled(Collapse)`
  position: relative;
`

const SubMenuHeader = styled('div')`
  display: flex;
  align-items: center;
  position: relative;
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  border-radius: 2px;
`

type SubMenuProps = {
  children: JSX.Element[]
  vertical?: boolean
}

const SubMenu = ({ children, vertical = false }: SubMenuProps) => {
  const [open, setOpen] = useState(false)
  const { isActiveItem } = useContext(MenuContext) as ContextType

  const handleDropDownClick = () => {
    setOpen((prev) => !prev)
  }

  const hideCollapse = () => {
    open && setOpen(false)
  }

  const options = children.map((item) => item.props.itemKey)
  const activeOption = options.filter((itemKey) => isActiveItem(itemKey))
  const header = activeOption.length ? activeOption[0] : options[0]

  const subComponents = React.Children.map(children, (child) => {
    return child.type === MenuItem ? child : null
  })

  return (
    <SubMenuContainer>
      <SubMenuHeader>
        <MenuItem itemKey={header} />
        <DropDown
          isActive={isActiveItem(header)}
          onClick={handleDropDownClick}
          data-testid="submenu-dropdown"
          role="button"
        >
          <Icon name="dropdown" />
        </DropDown>
      </SubMenuHeader>
      <OptionsItemsCollapse
        in={open}
        timeout="auto"
        unmountOnExit
        onClick={hideCollapse}
      >
        <ClickAwayListener onClickAway={hideCollapse}>
          <OptionsFlexContainer isVertical={vertical}>
            {subComponents.map((component) => component)}
          </OptionsFlexContainer>
        </ClickAwayListener>
      </OptionsItemsCollapse>
    </SubMenuContainer>
  )
}

export { SubMenu }
