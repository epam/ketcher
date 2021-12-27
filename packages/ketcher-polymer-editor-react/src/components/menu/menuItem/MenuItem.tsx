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
import { ListItem, ListItemProps, Box, ClickAwayListener } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import { useState } from 'react'
import Icon from 'components/shared/ui/Icon/Icon'
import styled from '@emotion/styled'
import { useDispatch, useSelector } from 'react-redux'
import { selectEditorActiveTool, selectTool } from 'state/common'
import { MenuItemVariant } from 'components/menu/menu.types'

interface MenuItemPropType {
  key: string
  name: MenuItemVariant
  options?: MenuItemVariant[]
}

interface SingleItemPropType {
  key: MenuItemVariant
  name: MenuItemVariant
  onClick: () => void
  activeTool: MenuItemVariant
}

interface MultiItemPropType {
  options: MenuItemVariant[]
  onClick: (name: MenuItemVariant) => any
  activeTool: MenuItemVariant
}

type StyledListItem = {
  'data-active': boolean
} & ListItemProps

const StyledListItem = styled(ListItem)<StyledListItem>`
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

const StyledBoxRelative = styled(Box)`
  display: flex;
  position: relative;
`

const StyledCollapseWrapper = styled(Box)`
  display: flex;
  position: absolute;
  background-color: white;
  left: 5px;
  border-radius: 2px;
  flex-direction: row;
`

const StyledDropDownIcon = styled(Icon)`
  position: absolute;
  bottom: 0;
  right: 0;
`

const StyledCollapse = styled(Collapse)`
  position: relative;
`

const MenuItem = ({ name, options }: MenuItemPropType) => {
  const dispatch = useDispatch()
  const activeTool = useSelector(selectEditorActiveTool)

  return options ? (
    <MultiItem
      options={options}
      onClick={(name) => dispatch(selectTool(name))}
      activeTool={activeTool}
    />
  ) : (
    <SingleItem
      key={name}
      name={name}
      onClick={() => dispatch(selectTool(name))}
      activeTool={activeTool}
    />
  )
}

const SingleItem = ({ name, activeTool, ...props }: SingleItemPropType) => {
  const isActiveTool = activeTool === name

  return (
    <StyledListItem data-active={isActiveTool} {...props}>
      <Icon name={name} />
    </StyledListItem>
  )
}

const MultiItem = ({ options, activeTool, onClick }: MultiItemPropType) => {
  const [open, setOpen] = useState(false)

  const handleDropDownClick = () => {
    setOpen((prev) => !prev)
  }

  const headerMultiTool = options.includes(activeTool) ? activeTool : options[0]
  const isActiveTool = activeTool === headerMultiTool

  return (
    <StyledBoxRelative>
      <StyledListItem
        data-active={isActiveTool}
        onClick={() => onClick(headerMultiTool)}
      >
        <Icon name={headerMultiTool} />
        <StyledDropDownIcon name="dropdown" onClick={handleDropDownClick} />
      </StyledListItem>
      <StyledCollapse in={open} timeout="auto" unmountOnExit>
        <ClickAwayListener
          onClickAway={() => {
            if (open) setOpen(false)
          }}
        >
          <StyledCollapseWrapper>
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
          </StyledCollapseWrapper>
        </ClickAwayListener>
      </StyledCollapse>
    </StyledBoxRelative>
  )
}

export { MenuItem }
