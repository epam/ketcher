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
import { render, screen, fireEvent } from '@testing-library/react'
import { Menu, MenuContext } from 'components/menu'

const mockClickHandler = jest.fn()
const MOCK_NAME = 'select-lasso'

const mockValue = {
  activate: mockClickHandler,
  isActive: (itemKey) => itemKey === MOCK_NAME
}

const mockMenuItem = () => {
  return withThemeProvider(
    <MenuContext.Provider value={mockValue}>
      <Menu.Item itemId="open" />
    </MenuContext.Provider>
  )
}

describe('Test MenuItem component', () => {
  it('should be rendered without crashing', () => {
    const { asFragment } = render(mockMenuItem())
    expect(asFragment).toMatchSnapshot()
  })
  it('should render menu icon element when props are provided', () => {
    render(mockMenuItem())
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
  it('should call provided callback when menu icon is clicked', () => {
    render(mockMenuItem())
    const button = screen.getByRole('menuitem')
    fireEvent.click(button)
    expect(mockClickHandler).toHaveBeenCalledTimes(1)
  })
})
