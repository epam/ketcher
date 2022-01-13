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
import userEvent from '@testing-library/user-event'

import { DropDown } from '../dropDown'

const mockSelectionHandler = jest.fn()
const MOCK_OPTIONS = ['Cat', 'Dog', 'Mantis']
const INITIAL_SELECTION = MOCK_OPTIONS[0]

const mockProps = {
  options: MOCK_OPTIONS,
  currentSelection: INITIAL_SELECTION,
  selectionHandler: mockSelectionHandler
}

describe('DropDown component', () => {
  it('should render an element with current selection displayed', () => {
    render(<DropDown {...mockProps} />)
    expect(screen.getByText(INITIAL_SELECTION)).toBeInTheDocument()
  })

  it('should render dropdown with all options when clicked', async () => {
    render(<DropDown {...mockProps} />)

    const dropDownButton = screen.getByRole('button')
    userEvent.click(dropDownButton)

    expect(await screen.findByText(MOCK_OPTIONS[1])).toBeInTheDocument()
    expect(await screen.findByText(MOCK_OPTIONS[2])).toBeInTheDocument()
  })

  it('should call selection handler when option is clicked', async () => {
    render(<DropDown {...mockProps} />)

    const dropDownButton = screen.getByRole('button')
    userEvent.click(dropDownButton)

    const secondOption = await screen.findByText(MOCK_OPTIONS[1])
    userEvent.click(secondOption)
    expect(mockSelectionHandler).toHaveBeenCalledWith(MOCK_OPTIONS[1])
  })
})
