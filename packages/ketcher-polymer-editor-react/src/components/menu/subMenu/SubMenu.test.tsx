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
import { SubMenu } from 'components/menu/subMenu/SubMenu'
import { MenuItemVariant } from 'components/menu/menu.types'
import userEvent from '@testing-library/user-event'

const mockClickHandler = jest.fn()
const MOCK_LABEL: MenuItemVariant = 'select-lasso'

const mockProps = {
  options: [MOCK_LABEL, MOCK_LABEL, MOCK_LABEL],
  onClick: mockClickHandler,
  activeTool: MOCK_LABEL
}

describe('Test Menu Multi Item component', () => {
  it('should render menu icon element when props are provided', () => {
    render(<SubMenu {...mockProps} />)
    expect(screen.getAllByRole('button')).toBeTruthy()
  })
  it('should call provided callback when menu icon is clicked', () => {
    render(<SubMenu {...mockProps} />)
    const button = screen.getAllByRole('button')[0]
    userEvent.click(button)
    expect(mockClickHandler).toHaveBeenCalledTimes(1)
  })
})
