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
import { useAppDispatch, useAppSelector } from 'hooks'
import { selectEditorActiveTool, selectTool } from 'state/common'
import { Menu } from 'components/menu/Menu'

const MenuContainer = () => {
  const dispatch = useAppDispatch()
  const activeTool = useAppSelector(selectEditorActiveTool)

  const menuProps = {
    activeItem: activeTool,
    onClick: (tool) => dispatch(selectTool(tool))
  }
  return (
    <Menu>
      <Menu.Group>
        <Menu.Item name="open" {...menuProps} />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item name="undo" {...menuProps} />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item name="erase" {...menuProps} />
        <Menu.Submenu vertical {...menuProps}>
          <Menu.Item name="select-lasso" {...menuProps} />
          <Menu.Item name="select-rectangle" {...menuProps} />
          <Menu.Item name="select-fragment" {...menuProps} />
        </Menu.Submenu>
        <Menu.Submenu {...menuProps}>
          <Menu.Item name="rectangle" {...menuProps} />
          <Menu.Item name="ellipse" {...menuProps} />
        </Menu.Submenu>
        <Menu.Submenu {...menuProps}>
          <Menu.Item name="rotate" {...menuProps} />
          <Menu.Item name="horizontal-flip" {...menuProps} />
          <Menu.Item name="vertical-flip" {...menuProps} />
        </Menu.Submenu>
      </Menu.Group>
      <Menu.Group>
        <Menu.Item name="single-bond" {...menuProps} />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item name="bracket" {...menuProps} />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item name="settings" {...menuProps} />
        <Menu.Item name="help" {...menuProps} />
      </Menu.Group>
    </Menu>
  )
}
export { MenuContainer }
