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
import { MenuItem } from '../menuItem'
import { useMenuContext } from '../../../hooks/useMenuContext'

const RootContainer = styled.div`
  display: flex;
  position: relative;
`

type OptionsContainerProps = {
  isVertical?: boolean
} & React.HTMLAttributes<HTMLDivElement>

const OptionsContainer = styled.div<OptionsContainerProps>`
  display: flex;
  position: absolute;
  left: 5px;
  border-radius: 2px;
  flex-direction: ${({ isVertical }) => (isVertical ? 'column' : 'row')};
`

type DropDownProps = {
  isActive: boolean
} & React.HTMLAttributes<HTMLDivElement>

const DropDown = styled.div<DropDownProps>`
  display: flex;
  width: 6px;
  height: 6px;
  position: absolute;
  bottom: 0;
  right: 0;

  > svg path {
    fill: ${({ isActive, theme }) =>
      isActive ? theme.color.icon.clicked : theme.color.icon.activeMenu};
  }
`

const OptionsItemsCollapse = styled(Collapse)`
  position: relative;
`

const VisibleItem = styled.div`
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
  const { isActive } = useMenuContext()

  const handleDropDownClick = () => {
    setOpen((prev) => !prev)
  }

  const hideCollapse = () => {
    open && setOpen(false)
  }

  const subComponents = React.Children.map(children, (child) => {
    return child.type === MenuItem ? child : null
  })

  const options = subComponents
    .map((item) => item.props.itemId)
    .filter((item) => item)
  const activeOption = options.filter((itemKey) => isActive(itemKey))
  const visibleItemId = activeOption.length ? activeOption[0] : options[0]

  return (
    <RootContainer>
      <VisibleItem>
        <MenuItem itemId={visibleItemId} />
        <DropDown
          isActive={isActive(visibleItemId)}
          onClick={handleDropDownClick}
        >
          <Icon name="dropdown" />
        </DropDown>
      </VisibleItem>
      <OptionsItemsCollapse
        in={open}
        timeout="auto"
        unmountOnExit
        onClick={hideCollapse}
      >
        <ClickAwayListener onClickAway={hideCollapse}>
          <OptionsContainer isVertical={vertical}>
            {subComponents.map((component) => component)}
          </OptionsContainer>
        </ClickAwayListener>
      </OptionsItemsCollapse>
    </RootContainer>
  )
}

export { SubMenu }
