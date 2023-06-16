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
import { render } from '@testing-library/react'
import { Menu } from 'components/menu/Menu'

const menuItemChanged = jest.fn()

const MenuContainer = () => {
  return (
    <Menu onItemClick={menuItemChanged}>
      <Menu.Group>
        <Menu.Item itemId="open" />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="erase" />
        <Menu.Submenu vertical>
          <Menu.Item itemId="select-lasso" />
          <Menu.Item itemId="select-rectangle" />
          <Menu.Item itemId="select-fragment" />
        </Menu.Submenu>
        <Menu.Submenu>
          <Menu.Item itemId="shape-rectangle" />
          <Menu.Item itemId="shape-ellipse" />
        </Menu.Submenu>
        <Menu.Submenu>
          <Menu.Item itemId="transform-flip-h" />
          <Menu.Item itemId="transform-flip-v" />
        </Menu.Submenu>
      </Menu.Group>
    </Menu>
  )
}

describe('Menu component', () => {
  it('should render menu component in a container', () => {
    expect(render(withThemeProvider(<MenuContainer />))).toMatchSnapshot()
  })
})
