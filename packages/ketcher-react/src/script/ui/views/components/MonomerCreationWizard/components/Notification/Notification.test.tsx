import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Notification from './Notification';

jest.mock('components', () => ({
  Icon: ({ name }) => <div data-testid={`icon-${name}`} />,
}));

describe('Monomer creation wizard notification', () => {
  it('does not allow dismissing error notifications manually', () => {
    render(
      <Notification
        id="emptyMandatoryFields"
        type="error"
        message="Mandatory fields must be filled."
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByTestId('notification-message-body')).toHaveTextContent(
      'Mandatory fields must be filled.',
    );
    expect(
      screen.queryByTestId('notification-message-ok-button'),
    ).not.toBeInTheDocument();
  });

  it('does not allow dismissing warning notifications manually', () => {
    render(
      <Notification
        id="defaultAttachmentPoints"
        type="warning"
        message="Warning message"
        onDismiss={jest.fn()}
      />,
    );

    expect(
      screen.queryByTestId('notification-message-ok-button'),
    ).not.toBeInTheDocument();
  });

  it('allows dismissing info notifications', () => {
    const onDismiss = jest.fn();

    render(
      <Notification
        id="defaultAttachmentPoints"
        type="info"
        message="Attachment points are set by default."
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(screen.getByTestId('notification-message-ok-button'));

    expect(onDismiss).toHaveBeenCalledWith('defaultAttachmentPoints');
  });
});
