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
import { render, screen } from 'test-utils'
import { MenuItem } from 'components/menu/menuItem/MenuItem'
import { MenuItemVariant } from 'components/menu/menu.types'
import userEvent from '@testing-library/user-event'

const mockClickHandler = jest.fn()
const MOCK_NAME: MenuItemVariant = 'select-lasso'

const mockProps = {
  name: MOCK_NAME,
  onClick: mockClickHandler,
  activeItem: MOCK_NAME
}

describe('Test MenuItem component', () => {
  it('should be rendered without crashing', () => {
    const { asFragment } = render(<MenuItem {...mockProps} />)
    expect(asFragment).toMatchSnapshot()
  })
  it('should render menu icon element when props are provided', () => {
    render(<MenuItem {...mockProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
  it('should call provided callback when menu icon is clicked', () => {
    render(<MenuItem {...mockProps} />)
    const button = screen.getByRole('button')
    userEvent.click(button)
    expect(mockClickHandler).toHaveBeenCalledTimes(1)
  })
})
