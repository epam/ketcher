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

import { TextareaAutoResize } from '../textareaAutoResize'

const MOCK_PROPS = {
  inputValue: 'Initial value',
  inputHandler: () => null,
  isFocused: true,
  isMultiLine: false,
  isCollapsed: false,
  setMultiLine: () => null,
  maxRows: 3
}

describe('TextareaAutoResize component', () => {
  it('should call input handler when input changes', () => {
    const mockInputHandler = jest.fn()

    render(
      <TextareaAutoResize {...MOCK_PROPS} inputHandler={mockInputHandler} />
    )
    const textarea = screen.getByDisplayValue(MOCK_PROPS.inputValue)

    const newInput = 'New'

    userEvent.type(textarea, newInput)
    expect(mockInputHandler).toHaveBeenCalledTimes(newInput.length)
  })

  it('should hide ellipsis if input is not overflowing', () => {
    render(<TextareaAutoResize {...MOCK_PROPS} />)
    const ellipsis = screen.getByText('...')

    expect(ellipsis).toHaveStyle('display: none')
  })
})

/* @TODO
Tests above do not test actual resizing behavior, because rendered scrollHeight cannot be calculated outside of browser.
As an enhancement for tests, it's possible to use stubs or mocks that implement scrollHeight calculation,
see example in mui:
https://github.com/mui-org/material-ui/blob/master/packages/mui-base/src/TextareaAutosize/TextareaAutosize.test.js */
