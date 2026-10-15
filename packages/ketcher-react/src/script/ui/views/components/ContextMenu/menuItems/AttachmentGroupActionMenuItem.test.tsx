import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import AttachmentGroupActionMenuItem from './AttachmentGroupActionMenuItem';

const mockItemProps = jest.fn();

jest.mock('react-contexify', () => ({
  Item: (
    props: PropsWithChildren<{
      onClick?: () => void;
      disabled?: boolean;
      'data-testid'?: string;
    }>,
  ) => {
    mockItemProps(props);
    const { children, onClick, disabled, 'data-testid': dataTestId } = props;
    return (
      <button data-testid={dataTestId} disabled={disabled} onClick={onClick}>
        {children}
      </button>
    );
  },
}));

jest.mock('@mui/material', () => ({
  Tooltip: ({ children }: PropsWithChildren) => children,
}));

jest.mock('../hooks/useAttachmentGroupCreate', () => ({
  __esModule: true,
  ATTACHMENT_GROUP_CREATION_DISABLED_TOOLTIP: 'disabled',
  default: () => ({ handler: jest.fn(), isDisabled: () => false }),
}));

jest.mock('../hooks/useAttachmentGroupDelete', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

describe('AttachmentGroupActionMenuItem', () => {
  beforeEach(() => {
    mockItemProps.mockClear();
  });

  it('shows Remove instead of Create for a removable Attachment Group', () => {
    render(
      <AttachmentGroupActionMenuItem
        showCreate
        propsFromTrigger={{
          id: 'atom-context-menu',
          atomIds: [1],
          attachmentGroupIds: [2],
        }}
      />,
    );

    expect(
      screen.getByTestId('Remove Attachment Group-option'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('Create Attachment Group-option'),
    ).not.toBeInTheDocument();
    expect(mockItemProps).not.toHaveBeenCalledWith(
      expect.objectContaining({ showCreate: expect.anything() }),
    );
  });

  it('shows Create when the selection has no removable Attachment Group', () => {
    render(
      <AttachmentGroupActionMenuItem
        showCreate
        propsFromTrigger={{
          id: 'atom-context-menu',
          atomIds: [1, 2],
        }}
      />,
    );

    expect(
      screen.getByTestId('Create Attachment Group-option'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('Remove Attachment Group-option'),
    ).not.toBeInTheDocument();
    expect(mockItemProps).not.toHaveBeenCalledWith(
      expect.objectContaining({ showCreate: expect.anything() }),
    );
  });
});
