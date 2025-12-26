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
import '@testing-library/jest-dom';
import Notification from './Notification';

describe('Notification Component', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    mockDispatch.mockClear();
  });

  test('renders info notification with OK button', () => {
    render(
      <Notification
        id="defaultAttachmentPoints"
        type="info"
        message="This is an info message"
        wizardStateDispatch={mockDispatch}
      />,
    );

    expect(screen.getByText('This is an info message')).toBeInTheDocument();
    expect(
      screen.getByTestId('notification-message-ok-button'),
    ).toBeInTheDocument();
  });

  test('renders error notification without OK button', () => {
    render(
      <Notification
        id="emptyMandatoryFields"
        type="error"
        message="This is an error message"
        wizardStateDispatch={mockDispatch}
      />,
    );

    expect(screen.getByText('This is an error message')).toBeInTheDocument();
    expect(
      screen.queryByTestId('notification-message-ok-button'),
    ).not.toBeInTheDocument();
  });

  test('renders warning notification without OK button', () => {
    render(
      <Notification
        id="emptyMandatoryFields"
        type="warning"
        message="This is a warning message"
        wizardStateDispatch={mockDispatch}
      />,
    );

    expect(screen.getByText('This is a warning message')).toBeInTheDocument();
    expect(
      screen.queryByTestId('notification-message-ok-button'),
    ).not.toBeInTheDocument();
  });

  test('OK button dispatches RemoveNotification action for info notifications', () => {
    render(
      <Notification
        id="defaultAttachmentPoints"
        type="info"
        message="This is an info message"
        wizardStateDispatch={mockDispatch}
      />,
    );

    const okButton = screen.getByTestId('notification-message-ok-button');
    fireEvent.click(okButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'RemoveNotification',
      id: 'defaultAttachmentPoints',
    });
  });

  test('renders with correct CSS classes for info type', () => {
    const { container } = render(
      <Notification
        id="defaultAttachmentPoints"
        type="info"
        message="Info message"
        wizardStateDispatch={mockDispatch}
      />,
    );

    const notificationElement = container.querySelector(
      '[data-testid="notification-defaultAttachmentPoints-message-banner"]',
    );
    expect(notificationElement).toHaveClass('info');
  });

  test('renders with correct CSS classes for error type', () => {
    const { container } = render(
      <Notification
        id="emptyMandatoryFields"
        type="error"
        message="Error message"
        wizardStateDispatch={mockDispatch}
      />,
    );

    const notificationElement = container.querySelector(
      '[data-testid="notification-emptyMandatoryFields-message-banner"]',
    );
    expect(notificationElement).toHaveClass('error');
  });
});
