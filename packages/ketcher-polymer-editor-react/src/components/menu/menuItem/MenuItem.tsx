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
import { ListItem, ListItemProps } from '@mui/material'
import styled from '@emotion/styled'
import { useDispatch, useSelector } from 'react-redux'
import { selectEditorActiveTool, selectTool } from 'state/common'
import { MenuItemVariant } from 'components/menu/menu.types'
import { SingleItem } from 'components/menu/menuItem/singleItem/SingleItem'
import { MultiItem } from 'components/menu/menuItem/multiItem/MultiItem'

interface MenuItemPropType {
  key: string
  name: MenuItemVariant
  options?: MenuItemVariant[]
  vertical?: boolean
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

const MenuItem = ({ name, options, vertical }: MenuItemPropType) => {
  const dispatch = useDispatch()
  const activeTool = useSelector(selectEditorActiveTool)

  return options ? (
    <MultiItem
      options={options}
      onClick={(name) => dispatch(selectTool(name))}
      activeTool={activeTool}
      vertical={vertical}
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

export { MenuItem, StyledListItem }
