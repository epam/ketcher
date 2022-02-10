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
import { Save } from 'components/modal/save'
import userEvent from '@testing-library/user-event'

const mockOnClose = jest.fn()

describe('Save modal', () => {
  it('renders correctly', () => {
    const view = render(<Save onClose={mockOnClose} isModalOpen={true} />)

    const filenameInput = screen.getByRole('textbox', {
      name: 'File name:'
    })
    const fileFormat = screen.getByRole('button', { name: 'MDL Molfile V3000' })

    expect(view).toMatchSnapshot()
    expect(filenameInput).toBeVisible()
    expect(filenameInput).toHaveValue('ketcher')
    expect(fileFormat).toBeVisible()
  })

  it('renders dropdown options correctly', () => {
    render(<Save onClose={mockOnClose} isModalOpen={true} />)

    const fileFormat = screen.getByRole('button', { name: 'MDL Molfile V3000' })

    userEvent.click(fileFormat)
    const fileFormatDropdown = screen.getByRole('listbox')
    const option1 = screen.getByRole('option', { name: 'MDL Molfile V3000' })
    const option2 = screen.getByRole('option', { name: 'HELM' })

    expect(fileFormatDropdown).toBeVisible()
    expect(option1).toBeVisible()
    expect(option2).toBeVisible()
  })
})
