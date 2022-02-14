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
import { Open } from './Open'
import React from 'react'
import userEvent from '@testing-library/user-event'

const mockProps = {
  isModalOpen: true,
  onClose: jest.fn()
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(React, 'useEffect').mockImplementation(() => {})

describe('Open component', () => {
  it('should render correctly', () => {
    expect(render(<Open {...mockProps} />)).toMatchSnapshot()
  })
  it('paste from clipboard', () => {
    const mockTypedText = 'more typed text'
    render(<Open {...mockProps} />)
    const clipboardButton = screen.getByRole('button', {
      name: 'Paste from Clipboard'
    })
    userEvent.click(clipboardButton)

    const clipboardTextarea = screen.getByRole('textbox')
    userEvent.type(clipboardTextarea, mockTypedText)
    expect(clipboardTextarea).toBeInTheDocument()
    expect(clipboardTextarea).toHaveValue(mockTypedText)

    const newProjectButton = screen.getByRole('button', {
      name: 'Open as New Project'
    })
    userEvent.click(newProjectButton)
    expect(mockProps.onClose).toHaveBeenCalled()
  })
})
