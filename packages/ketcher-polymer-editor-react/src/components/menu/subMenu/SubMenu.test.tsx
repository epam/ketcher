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
import { MenuItemVariant } from 'components/menu/menu.types'
import { Menu } from 'components/menu'
import userEvent from '@testing-library/user-event'

const mockClickHandler = jest.fn()
const MOCK_NAME: MenuItemVariant = 'select-lasso'
const mockProps = {
  onClick: mockClickHandler,
  activeItem: MOCK_NAME
}

const mockMenuItems = [
  <Menu.Item name="help" {...mockProps} />,
  <Menu.Item name="settings" {...mockProps} />,
  <Menu.Item name="undo" {...mockProps} />
]

const openSubMenu = () => {
  const presetDropDownBtn = screen.getByTestId('submenu-btn')
  userEvent.click(presetDropDownBtn)
}

const mockSubMenu = () => {
  return (
    <Menu.Submenu vertical {...mockProps}>
      {...mockMenuItems}
    </Menu.Submenu>
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
    expect(screen.getByTestId('submenu-options')).toBeDefined()
  })
  it('should call provided callback when header icon is clicked', () => {
    render(mockSubMenu())
    const button = screen.getAllByRole('button')[0]
    userEvent.click(button)
    expect(mockClickHandler).toHaveBeenCalled()
  })
})
