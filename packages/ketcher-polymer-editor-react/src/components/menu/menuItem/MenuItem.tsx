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
import { selectEditorActiveTool, selectTool } from 'state/common'
import { MenuItemVariant } from 'components/menu/menu.types'
import { SingleItem } from 'components/menu/menuItem/singleItem'
import { MultiItem } from 'components/menu/menuItem/multiItem'
import { useAppDispatch, useAppSelector } from 'hooks'

interface MenuItemPropType {
  key: string
  name: MenuItemVariant
  options?: MenuItemVariant[]
  vertical?: boolean
}

const MenuItem = ({ name, options, vertical }: MenuItemPropType) => {
  const dispatch = useAppDispatch()
  const activeTool = useAppSelector(selectEditorActiveTool)

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

export { MenuItem }
