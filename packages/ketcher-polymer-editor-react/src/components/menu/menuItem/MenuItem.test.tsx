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

const MOCK_LABEL: MenuItemVariant = 'select-lasso'

const singleMockProps = {
  key: MOCK_LABEL,
  name: MOCK_LABEL
}

const multiMockProps = {
  key: MOCK_LABEL,
  name: MOCK_LABEL,
  options: [MOCK_LABEL, MOCK_LABEL]
}

describe('Test Menu Item component', () => {
  it('should render single item element based on props are provided', () => {
    render(<MenuItem {...singleMockProps} />)
    expect(screen.getAllByRole('button').length).toEqual(1)
  })
  it('should render multi item element based on props are provided', () => {
    render(<MenuItem {...multiMockProps} />)
    expect(screen.getAllByRole('button').length).toEqual(2)
  })
})
