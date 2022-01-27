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
import { screen } from '@testing-library/react'
import { Menu, MenuContext } from 'components/menu'
import userEvent from '@testing-library/user-event'
import { MenuItemVariant } from 'components/menu/menu.types'

const mockClickHandler = jest.fn()
const MOCK_NAME: MenuItemVariant = 'select-lasso'

const mockValue = {
  selectItemHandler: mockClickHandler,
  isActiveItem: (itemKey) => itemKey === MOCK_NAME
}

const mockMenuItems = [
  <Menu.Item itemKey="help" />,
  <Menu.Item itemKey="settings" />,
  <Menu.Item itemKey="undo" />
]

const openSubMenu = () => {
  const presetDropDownBtn = screen.getByTestId('submenu-dropdown')
  userEvent.click(presetDropDownBtn)
}

const mockSubMenu = () => {
  return (
    <MenuContext.Provider value={mockValue}>
      <Menu.Submenu vertical>{...mockMenuItems}</Menu.Submenu>
    </MenuContext.Provider>
  )
}

describe('Test SubMenu component', () => {
  it('should be rendered without crashing', () => {
    const { asFragment } = render(mockSubMenu())
    expect(asFragment).toMatchSnapshot()
  })
  it('should show menu dropdown on click', () => {
    render(mockSubMenu())
    openSubMenu()
    expect(screen.getAllByRole('menuitem').length).toEqual(4)
  })
  it('should call provided callback when header icon is clicked', () => {
    render(mockSubMenu())
    const button = screen.getByRole('menuitem')
    userEvent.click(button)
    expect(mockClickHandler).toHaveBeenCalled()
  })
})
