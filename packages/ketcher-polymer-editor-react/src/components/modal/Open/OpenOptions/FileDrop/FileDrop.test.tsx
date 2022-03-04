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
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FileDrop } from './FileDrop'

const mockProps = {
  buttonLabel: 'Open from file',
  textLabel: 'or drag file here',
  iconName: 'arrow-up',
  onDropAccepted: jest.fn()
}

const mockOptionalProps = {
  disabled: true,
  disabledText: 'Mock disabled text'
}

const mockFile = new File(['ketcher mol file'], 'ketcher.mol', {
  type: 'chem/mol'
})

describe('FileDrop component', () => {
  it('should render correctly', () => {
    expect(
      render(withThemeProvider(<FileDrop {...mockProps} />))
    ).toMatchSnapshot()
  })

  it('should render correctly with required props', () => {
    render(withThemeProvider(<FileDrop {...mockProps} />))

    expect(
      screen.getByRole('button', { name: mockProps.buttonLabel })
    ).toBeInTheDocument()
    expect(screen.getByText(mockProps.textLabel)).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('should render correctly with optional props', () => {
    render(
      withThemeProvider(<FileDrop {...mockProps} {...mockOptionalProps} />)
    )

    expect(
      screen.getByRole('button', { name: mockProps.buttonLabel })
    ).toBeInTheDocument()
    expect(screen.getByText(mockProps.textLabel)).toBeInTheDocument()
    expect(screen.getByText(mockOptionalProps.disabledText)).toBeInTheDocument()
  })

  it('should upload file', async () => {
    const { container } = render(withThemeProvider(<FileDrop {...mockProps} />))
    const input = container.querySelector(
      'input[type=file]'
    ) as HTMLInputElement

    userEvent.upload(input, mockFile)

    await waitFor(() => {
      expect(input.files && input.files[0]).toBe(mockFile)
    })
    await waitFor(() => {
      expect(input.files && input.files.item(0)).toBe(mockFile)
    })
    await waitFor(() => {
      expect(input.files && input.files).toHaveLength(1)
    })
  })

  it('accepted file callback should be called after file is uploaded', async () => {
    const { container } = render(withThemeProvider(<FileDrop {...mockProps} />))
    const input = container.querySelector(
      'input[type=file]'
    ) as HTMLInputElement

    userEvent.upload(input, mockFile)

    await waitFor(() => {
      expect(mockProps.onDropAccepted).toBeCalled()
    })
  })
})
