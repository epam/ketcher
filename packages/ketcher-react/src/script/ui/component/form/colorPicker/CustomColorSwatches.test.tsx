import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CustomColorSwatches from './CustomColorSwatches';

const defaultProps = {
  customColors: ['#123456', '#ABCDEF'],
  pendingColor: '#123456',
  onSelectColor: jest.fn(),
  isCustomOpen: false,
  onToggleCustomOpen: jest.fn(),
};

describe('CustomColorSwatches', () => {
  it('renders a swatch for every custom color and highlights the selected one', () => {
    render(<CustomColorSwatches {...defaultProps} />);
    expect(screen.getByRole('button', { name: '#ABCDEF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#123456' }).className).toContain(
      'swatchSelected',
    );
  });

  it('renders no swatch row when there are no custom colors', () => {
    render(<CustomColorSwatches {...defaultProps} customColors={[]} />);
    expect(screen.queryByRole('button', { name: /#/ })).not.toBeInTheDocument();
  });

  it('calls onSelectColor when a custom swatch is clicked', async () => {
    const onSelectColor = jest.fn();
    render(
      <CustomColorSwatches {...defaultProps} onSelectColor={onSelectColor} />,
    );
    await userEvent.click(screen.getByRole('button', { name: '#ABCDEF' }));
    expect(onSelectColor).toHaveBeenCalledWith('#ABCDEF');
  });

  it('calls onToggleCustomOpen when the toggle button is clicked', async () => {
    const onToggleCustomOpen = jest.fn();
    render(
      <CustomColorSwatches
        {...defaultProps}
        onToggleCustomOpen={onToggleCustomOpen}
      />,
    );
    await userEvent.click(screen.getByTestId('color-picker-btn'));
    expect(onToggleCustomOpen).toHaveBeenCalled();
  });

  it('shows the correct toggle affordance for open/closed state', () => {
    const { rerender } = render(
      <CustomColorSwatches {...defaultProps} isCustomOpen={false} />,
    );
    expect(
      screen.getByRole('button', { name: 'Open custom colors' }),
    ).toBeInTheDocument();

    rerender(<CustomColorSwatches {...defaultProps} isCustomOpen={true} />);
    expect(
      screen.getByRole('button', { name: 'Close custom colors' }),
    ).toBeInTheDocument();
  });
});
