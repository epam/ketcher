import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModeControl } from './ModeControl';

jest.mock('components', () => ({
  Icon: ({ name, dataTestId, disabled }) => (
    <span
      data-testid={dataTestId ?? `icon-${name}`}
      data-disabled={disabled ? 'true' : 'false'}
    />
  ),
}));

describe('ModeControl', () => {
  it('disables the molecules/macromolecules switcher', async () => {
    render(<ModeControl toggle={jest.fn()} isPolymerEditor={false} disabled />);

    const switcher = screen.getByTestId('polymer-toggler');
    const leadingIcon = screen.getByTestId('mode-switcher-icon');

    expect(switcher).toBeDisabled();
    expect(leadingIcon).toHaveAttribute('data-disabled', 'true');

    expect(screen.queryByTestId('molecules_mode')).not.toBeInTheDocument();
    expect(screen.queryByTestId('macromolecules_mode')).not.toBeInTheDocument();
  });

  it('opens the switcher menu when enabled', async () => {
    const user = userEvent.setup();

    render(<ModeControl toggle={jest.fn()} isPolymerEditor={false} />);

    expect(screen.getByTestId('mode-switcher-icon')).toHaveAttribute(
      'data-disabled',
      'false',
    );

    await user.click(screen.getByTestId('polymer-toggler'));

    expect(screen.getByTestId('molecules_mode')).toBeInTheDocument();
    expect(screen.getByTestId('macromolecules_mode')).toBeInTheDocument();
  });
});
