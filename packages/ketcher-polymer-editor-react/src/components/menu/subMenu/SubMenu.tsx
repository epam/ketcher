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
import React, { useState } from 'react'
import { ClickAwayListener } from '@mui/material'
import styled from '@emotion/styled'
import Collapse from '@mui/material/Collapse'
import { Icon } from 'components/shared/ui/icon'
import { MenuItemVariant } from 'components/menu/menu.types'

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

type SubMenuHeaderProps = {
  isActive: boolean
} & React.HTMLAttributes<HTMLDivElement>

const SubMenuHeader = styled('div')<SubMenuHeaderProps>`
  display: flex;
  align-items: center;
  position: relative;
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  border-radius: 2px;
  background-color: ${(props) =>
    props.isActive
      ? props.theme.color.icon.activeMenu
      : props.theme.color.background.primary};

  :hover {
    transform: scale(1.2);
  }

  > svg path {
    fill: ${(props) =>
      props.isActive
        ? props.theme.color.icon.clicked
        : props.theme.color.icon.activeMenu};
  }
`

type SubMenuProps = {
  children: JSX.Element[]
  activeItem: MenuItemVariant
  onClick: (name: MenuItemVariant) => void
  vertical?: boolean
}

const SubMenu = ({
  children,
  activeItem,
  onClick,
  vertical = false
}: SubMenuProps) => {
  const [open, setOpen] = useState(false)

  const handleDropDownClick = () => {
    setOpen((prev) => !prev)
  }

  const options = children.map((item) => item.props.name)
  const header = options.includes(activeItem) ? activeItem : options[0]
  const isActiveTool = activeItem === header

  return (
    <SubMenuContainer>
      <SubMenuHeader
        isActive={isActiveTool}
        onClick={() => onClick(header)}
        role="button"
      >
        <Icon name={header} />
        <DropDown
          isActive={isActiveTool}
          onClick={handleDropDownClick}
          data-testid="submenu-btn"
          role="button"
        >
          <Icon name="dropdown" />
        </DropDown>
      </SubMenuHeader>
      <OptionsItemsCollapse in={open} timeout="auto" unmountOnExit>
        <ClickAwayListener
          onClickAway={() => {
            open && setOpen(false)
          }}
        >
          <OptionsFlexContainer
            isVertical={vertical}
            data-testid="submenu-options"
          >
            {children}
          </OptionsFlexContainer>
        </ClickAwayListener>
      </OptionsItemsCollapse>
    </SubMenuContainer>
  )
}

export { SubMenu }
