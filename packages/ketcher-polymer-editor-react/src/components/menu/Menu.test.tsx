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
import { render } from 'test-utils'
import { Menu } from 'components/menu/Menu'

const menuItemChanged = jest.fn()

const MenuContainer = () => {
  return (
    <Menu menuItemChanged={menuItemChanged}>
      <Menu.Group>
        <Menu.Item itemKey="open" />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemKey="erase" />
        <Menu.Submenu vertical>
          <Menu.Item itemKey="select-lasso" />
          <Menu.Item itemKey="select-rectangle" />
          <Menu.Item itemKey="select-fragment" />
        </Menu.Submenu>
        <Menu.Submenu>
          <Menu.Item itemKey="rectangle" />
          <Menu.Item itemKey="ellipse" />
        </Menu.Submenu>
        <Menu.Submenu>
          <Menu.Item itemKey="rotate" />
          <Menu.Item itemKey="horizontal-flip" />
          <Menu.Item itemKey="vertical-flip" />
        </Menu.Submenu>
      </Menu.Group>
    </Menu>
  )
}

describe('Menu component', () => {
  it('should render menu component in a container', () => {
    expect(render(<MenuContainer />)).toMatchSnapshot()
  })
})
