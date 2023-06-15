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

import { fireEvent, screen, render } from '@testing-library/react'

import { Switcher } from './'

describe('RNA Switcher component', () => {
  const mockSetActiveMonomerType = jest.fn()
  const buttons = ['R(A)P', 'R', 'A', 'P']

  it('should call click event handler on each button when clicked', () => {
    render(
      withThemeProvider(
        <Switcher
          selectedMonomers={['R', 'A', 'P']}
          setActiveMonomerType={mockSetActiveMonomerType}
        />
      )
    )
    buttons.forEach((button, index) => {
      const buttonR = screen.getByText(button)
      fireEvent.click(buttonR)
      expect(mockSetActiveMonomerType.mock.calls.length).toEqual(index + 1)
    })
  })

  it('should render correctly with each button selected', () => {
    const view = render(
      withThemeProvider(
        <Switcher
          selectedMonomers={['R', 'A', 'P']}
          setActiveMonomerType={mockSetActiveMonomerType}
        />
      )
    )
    buttons.forEach((button) => {
      const buttonR = screen.getByText(button)
      fireEvent.click(buttonR)
      expect(view).toMatchSnapshot()
    })
  })

  it('should reset to initial state when reset button clicked', () => {
    render(
      withThemeProvider(
        <Switcher
          selectedMonomers={['R', 'A', 'P']}
          setActiveMonomerType={mockSetActiveMonomerType}
        />
      )
    )
    const sugarBtn = screen.getByText(buttons[1])
    fireEvent.click(sugarBtn)
    const resetBtn = screen.getByText('Reset')
    fireEvent.click(resetBtn)
    const nucleotideBtn = screen.getByText(buttons[0])
    expect(nucleotideBtn).toHaveStyle(`background-color: rgb(22, 119, 130)`)
  })
})
