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

import { DropDown, DropDownProps } from './dropDown'

const mockSelectionHandler = jest.fn()
const MOCK_OPTIONS = [
  { id: '1', label: 'Cat' },
  { id: '2', label: 'Dog' },
  { id: '3', label: 'Mantis' }
]
const INITIAL_SELECTION = MOCK_OPTIONS[0]

const mockProps: DropDownProps = {
  options: MOCK_OPTIONS,
  currentSelection: INITIAL_SELECTION.id,
  selectionHandler: mockSelectionHandler
}

describe.skip('DropDown component', () => {
  it('should render an element with current selection displayed', () => {
    render(withThemeProvider(<DropDown {...mockProps} />))
    expect(screen.getByText(INITIAL_SELECTION.label)).toBeInTheDocument()
  })

  it('should render dropdown with all options when clicked', async () => {
    render(withThemeProvider(<DropDown {...mockProps} />))

    const dropDownButton = screen.getByTestId('dropdown-select')
    fireEvent.click(dropDownButton)

    expect(await screen.findByText(MOCK_OPTIONS[1].label)).toBeInTheDocument()
    expect(await screen.findByText(MOCK_OPTIONS[2].label)).toBeInTheDocument()
  })

  it('should call selection handler with id when label is clicked', async () => {
    render(withThemeProvider(<DropDown {...mockProps} />))

    const dropDownButton = screen.getByTestId('dropdown-select')
    fireEvent.click(dropDownButton)

    const secondOption = await screen.findByText(MOCK_OPTIONS[1].label)
    fireEvent.click(secondOption)
    expect(mockSelectionHandler).toHaveBeenCalledWith(MOCK_OPTIONS[1].id)
  })
})
