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
import { Modal } from '.'
import userEvent from '@testing-library/user-event'

const mockOnCloseHandler = jest.fn()

const mockModal = () => {
  return (
    <Modal title="title" isModalOpen={true} onCloseHandler={mockOnCloseHandler}>
      <Modal.Content>Content</Modal.Content>
    </Modal>
  )
}

describe('Modal component', () => {
  it('should render with passed title', () => {
    render(mockModal())
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('should render with passed content', () => {
    render(mockModal())
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should call close handler when close icon clicked', () => {
    render(mockModal())

    const closeIcon = screen.getByTitle('Close window')
    userEvent.click(closeIcon)

    expect(mockOnCloseHandler).toHaveBeenCalledTimes(1)
  })
})
