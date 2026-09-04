import { render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import AttachmentGroupMenuItems from './AttachmentGroupMenuItems';

jest.mock('react-contexify', () => ({
  Item: ({
    children,
    ...props
  }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('../hooks/useAttachmentGroupDelete', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

describe('AttachmentGroupMenuItems', () => {
  it('shows the Remove attachment group action', () => {
    render(<AttachmentGroupMenuItems />);

    expect(screen.getByText('Remove attachment group')).toBeInTheDocument();
    expect(
      screen.getByTestId('Remove Attachment Group-option'),
    ).toBeInTheDocument();
  });
});
