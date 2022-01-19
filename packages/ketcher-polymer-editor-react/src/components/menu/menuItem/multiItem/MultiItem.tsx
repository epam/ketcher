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
import { MenuItemVariant } from 'components/menu/menu.types'
import React, { useState } from 'react'
import { ClickAwayListener } from '@mui/material'
import { SingleItem } from 'components/menu/menuItem/singleItem'
import styled from '@emotion/styled'
import Collapse from '@mui/material/Collapse'

interface MultiItemPropType {
  options: MenuItemVariant[]
  onClick: (name: MenuItemVariant) => any
  activeTool: MenuItemVariant
  vertical?: boolean
}

const MultiItemContainer = styled('div')`
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

// const DropDownIcon = styled(Icon)`
//   position: absolute;
//   bottom: 0;
//   right: 0;
// `

const OptionsItemsCollapse = styled(Collapse)`
  position: relative;
`

type MultiItemHeaderProps = {
  isActive: boolean
} & React.HTMLAttributes<HTMLDivElement>

const MultiItemHeader = styled('div')<MultiItemHeaderProps>`
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

const MultiItem = ({
  options,
  activeTool,
  onClick,
  vertical
}: MultiItemPropType) => {
  const [open, setOpen] = useState(false)

  // const handleDropDownClick = () => {
  //   setOpen((prev) => !prev)
  // }

  const headerMultiTool = options.includes(activeTool) ? activeTool : options[0]
  const isActiveTool = activeTool === headerMultiTool

  return (
    <MultiItemContainer>
      <MultiItemHeader
        isActive={isActiveTool}
        onClick={() => onClick(headerMultiTool)}
        role="button"
      >
        {/* <Icon name={headerMultiTool} /> */}
        {/* <DropDownIcon */}
        {/*  name="dropdown" */}
        {/*  onClick={handleDropDownClick} */}
        {/*  role="button" */}
        {/* /> */}
      </MultiItemHeader>
      <OptionsItemsCollapse in={open} timeout="auto" unmountOnExit>
        <ClickAwayListener
          onClickAway={() => {
            open && setOpen(false)
          }}
        >
          <OptionsFlexContainer isVertical={vertical}>
            {options?.map((name) => (
              <SingleItem
                key={name}
                name={name}
                activeTool={activeTool}
                onClick={() => {
                  onClick(name)
                  setOpen(false)
                }}
              />
            ))}
          </OptionsFlexContainer>
        </ClickAwayListener>
      </OptionsItemsCollapse>
    </MultiItemContainer>
  )
}

export { MultiItem }
