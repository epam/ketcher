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

  it('should show "Expand window" tooltip when not expanded', () => {
    const mockSetExpanded = jest.fn();
    render(
      withThemeProvider(
        <Modal
          title="title"
          isOpen={true}
          showExpandButton={true}
          expanded={false}
          setExpanded={mockSetExpanded}
          onClose={mockOnCloseHandler}
        >
          <Modal.Content>Content</Modal.Content>
        </Modal>,
      ),
    );

    expect(screen.getByTitle('Expand window')).toBeInTheDocument();
  });

  it('should show "Minimize window" tooltip when expanded', () => {
    const mockSetExpanded = jest.fn();
    render(
      withThemeProvider(
        <Modal
          title="title"
          isOpen={true}
          showExpandButton={true}
          expanded={true}
          setExpanded={mockSetExpanded}
          onClose={mockOnCloseHandler}
        >
          <Modal.Content>Content</Modal.Content>
        </Modal>,
      ),
    );

    expect(screen.getByTitle('Minimize window')).toBeInTheDocument();
  });

  it('should toggle tooltip when expand button is clicked', () => {
    let expanded = false;
    const mockSetExpanded = jest.fn((newValue) => {
      expanded = newValue;
    });

    const { rerender } = render(
      withThemeProvider(
        <Modal
          title="title"
          isOpen={true}
          showExpandButton={true}
          expanded={expanded}
          setExpanded={mockSetExpanded}
          onClose={mockOnCloseHandler}
        >
          <Modal.Content>Content</Modal.Content>
        </Modal>,
      ),
    );

    const expandButton = screen.getByTitle('expand window');
    fireEvent.click(expandButton);

    expect(mockSetExpanded).toHaveBeenCalledWith(true);

    // Re-render with expanded state
    rerender(
      withThemeProvider(
        <Modal
          title="title"
          isOpen={true}
          showExpandButton={true}
          expanded={true}
          setExpanded={mockSetExpanded}
          onClose={mockOnCloseHandler}
        >
          <Modal.Content>Content</Modal.Content>
        </Modal>,
      ),
    );

    expect(screen.getByTitle('minimize window')).toBeInTheDocument();
  });
});
