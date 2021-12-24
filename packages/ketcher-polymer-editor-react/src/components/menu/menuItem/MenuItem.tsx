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
import { ListItem, ListItemProps, Box } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import { useState } from 'react'
import Icon from 'components/shared/ui/Icon/Icon'
import styled from '@emotion/styled'
import { useDispatch, useSelector } from 'react-redux'
import { selectEditorActiveTool, selectTool } from 'state/common'

// interface MenuItemPropType extends MenuItemType {
//   key: string,
//     onClick: () => void
// }

type StyledListItem = {
  active: boolean
} & ListItemProps

const StyledListItem = styled(ListItem)<StyledListItem>`
  width: 28px;
  height: 28px;
  margin: 4px 0;
  padding: 0;
  justify-content: center;
  border-radius: 2px;
  background-color: ${(props) =>
    props.active ? 'rgba(0, 131, 143, 0.4)' : 'white'};

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

const MenuItem = ({ name, options }) => {
  const dispatch = useDispatch()
  const activeTool = useSelector(selectEditorActiveTool)

  const isActiveTool = activeTool === name

  const Component = options ? MultiItem : SingleItem
  return (
    <Component
      key={name}
      name={name}
      options={options}
      onClick={() => dispatch(selectTool(name))}
      active={isActiveTool}
    />
  )
}

const SingleItem = ({ name, active, ...props }) => {
  return (
    <StyledListItem active={active} {...props}>
      <Icon name={name} />
    </StyledListItem>
  )
}

const MultiItem = ({ name, options, active, ...props }) => {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    setOpen((prev) => !prev)
  }

  return (
    <StyledBoxRelative>
      <StyledListItem active={active} {...props}>
        <Icon name={name} />
        <StyledDropDownIcon name="dropdown" onClick={handleClick} />
      </StyledListItem>
      <StyledCollapse in={open} timeout="auto" unmountOnExit>
        <StyledCollapseWrapper>
          {options?.map((name, index) => (
            <SingleItem key={index} name={name} active={active} {...props} />
          ))}
        </StyledCollapseWrapper>
      </StyledCollapse>
    </StyledBoxRelative>
  )
}

export { MenuItem }
