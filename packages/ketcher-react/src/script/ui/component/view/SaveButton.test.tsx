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

import { render, screen } from '@testing-library/react'
import { SaveButton } from './savebutton'

jest.mock('../../../../hooks', () => {
  return {
    ...jest.requireActual('../../../../hooks'),
    useAppContext: () => ({
      getKetcherInstance: () => null
    })
  }
})

jest.mock('ketcher-core')

describe('SaveButton', () => {
  const defaultProps = {
    filename: 'test.mol',
    data: ''
  }

  describe('Disabled state', () => {
    it('Should be enabled by default', () => {
      render(<SaveButton {...defaultProps}>Save</SaveButton>)
      const btn = screen.getByRole('button')
      expect(btn).toBeEnabled()
    })

    it('Should be disabled', () => {
      render(
        <SaveButton {...defaultProps} disabled>
          Save
        </SaveButton>
      )
      const btn = screen.getByRole('button')
      expect(btn).toBeDisabled()
    })
  })
})
