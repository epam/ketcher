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
import { TextEditor } from './TextEditor'
import { render, screen } from 'test-utils'
import userEvent from '@testing-library/user-event'

const mockProps = {
  structStr: 'mock content value',
  inputHandler: jest.fn()
}

describe('TextEditor component', () => {
  it('should render correctly with passed props', () => {
    render(<TextEditor {...mockProps} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue(mockProps.structStr)
  })
  it('onChange callback should be called after typing', async () => {
    render(<TextEditor {...mockProps} />)
    const mockTypedText = 'additional struct'
    const textarea = screen.getByRole('textbox')
    userEvent.type(textarea, mockTypedText)

    expect(mockProps.inputHandler).toBeCalled()
  })
})
