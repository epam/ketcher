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
import { useState } from 'react'
import Icon from 'components/shared/ui/Icon/Icon'
import { ClickAwayListener } from '@mui/material'
import { SingleItem } from 'components/menu/menuItem/singleItem/SingleItem'
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

const OptionsFlexContainer = styled('div')`
  display: flex;
  position: absolute;
  background-color: white;
  left: 5px;
  border-radius: 2px;
  flex-direction: ${(props) => (props['data-orientation'] ? 'column' : 'row')};
`

const DropDownIcon = styled(Icon)`
  position: absolute;
  bottom: 0;
  right: 0;
`

const OptionsItemsCollapse = styled(Collapse)`
  position: relative;
`

const MultiItemHeader = styled('div')`
  display: flex;
  align-items: center;
  position: relative;
  width: 28px;
  height: 28px;
  margin: 4px 0;
  padding: 0;
  justify-content: center;
  border-radius: 2px;
  background-color: ${(props) =>
    props['data-active'] ? 'rgba(0, 131, 143, 0.4)' : 'white'};

  :hover {
    transform: scale(1.2);
  }
`

const MultiItem = ({
  options,
  activeTool,
  onClick,
  vertical
}: MultiItemPropType) => {
  const [open, setOpen] = useState(false)

  const handleDropDownClick = () => {
    setOpen((prev) => !prev)
  }

  const headerMultiTool = options.includes(activeTool) ? activeTool : options[0]
  const isActiveTool = activeTool === headerMultiTool

  return (
    <MultiItemContainer>
      <MultiItemHeader
        data-active={isActiveTool}
        onClick={() => onClick(headerMultiTool)}
      >
        <Icon name={headerMultiTool} />
        <DropDownIcon name="dropdown" onClick={handleDropDownClick} />
      </MultiItemHeader>
      <OptionsItemsCollapse in={open} timeout="auto" unmountOnExit>
        <ClickAwayListener
          onClickAway={() => {
            if (open) setOpen(false)
          }}
        >
          <OptionsFlexContainer data-orientation={vertical}>
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
