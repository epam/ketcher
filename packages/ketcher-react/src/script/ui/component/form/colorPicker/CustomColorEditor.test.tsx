import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CustomColorEditor from './CustomColorEditor';

const defaultProps = {
  customColors: ['#123456', '#ABCDEF'],
  pendingColor: '#123456',
  hue: 0,
  lightness: 50,
  hexInput: '123456',
  onHueChange: jest.fn(),
  onLightnessChange: jest.fn(),
  onHexInputChange: jest.fn(),
  onDeleteCustomColor: jest.fn(),
};

describe('CustomColorEditor', () => {
  it('renders sliders and hex input with the current values', () => {
    render(<CustomColorEditor {...defaultProps} />);
    expect(screen.getByTestId('color-palette')).toBeInTheDocument();
    expect(screen.getByTestId('color-picker-input')).toHaveValue('123456');
  });

  it('calls onHexInputChange when the hex input changes', () => {
    const onHexInputChange = jest.fn();
    render(
      <CustomColorEditor
        {...defaultProps}
        onHexInputChange={onHexInputChange}
      />,
    );
    fireEvent.change(screen.getByTestId('color-picker-input'), {
      target: { value: 'ABCDEF' },
    });
    expect(onHexInputChange).toHaveBeenCalled();
  });

  it('enables the delete button when pendingColor matches a custom color', () => {
    render(<CustomColorEditor {...defaultProps} pendingColor="#123456" />);
    expect(
      screen.getByRole('button', { name: 'Delete custom color' }),
    ).not.toBeDisabled();
  });

  it('disables the delete button when pendingColor is not a custom color', () => {
    render(<CustomColorEditor {...defaultProps} pendingColor="#FF0000" />);
    expect(
      screen.getByRole('button', { name: 'Delete custom color' }),
    ).toBeDisabled();
  });

  it('calls onDeleteCustomColor when the delete button is clicked', async () => {
    const onDeleteCustomColor = jest.fn();
    render(
      <CustomColorEditor
        {...defaultProps}
        onDeleteCustomColor={onDeleteCustomColor}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete custom color' }),
    );
    expect(onDeleteCustomColor).toHaveBeenCalled();
  });
});
