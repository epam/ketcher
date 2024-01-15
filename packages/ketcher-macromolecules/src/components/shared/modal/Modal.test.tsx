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

import { render, screen, fireEvent } from '@testing-library/react';

import { Modal } from '.';

const mockOnCloseHandler = jest.fn();

const mockModal = () => {
  return (
    <Modal title="title" isOpen={true} onClose={mockOnCloseHandler}>
      <Modal.Content>Content</Modal.Content>
    </Modal>
  );
};

describe('Modal component', () => {
  it('should render correctly', () => {
    expect(render(withThemeProvider(mockModal()))).toMatchSnapshot();
  });

  it('should render with passed title', () => {
    render(withThemeProvider(mockModal()));
    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('should render with passed content', () => {
    render(withThemeProvider(mockModal()));
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should call close handler when close icon clicked', () => {
    render(withThemeProvider(mockModal()));

    const closeIcon = screen.getByTitle('Close window');
    fireEvent.click(closeIcon);

    expect(mockOnCloseHandler).toHaveBeenCalledTimes(1);
  });

  it('should not render close icon if showCloseButton prop set to false', () => {
    render(
      withThemeProvider(
        <Modal
          title="title"
          isOpen={true}
          showCloseButton={false}
          onClose={mockOnCloseHandler}
        >
          <Modal.Content>Content</Modal.Content>
        </Modal>,
      ),
    );

    expect(screen.queryByTitle('Close window')).not.toBeInTheDocument();
  });
});
