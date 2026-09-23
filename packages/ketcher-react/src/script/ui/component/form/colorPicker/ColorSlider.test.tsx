import { fireEvent, render, screen } from '@testing-library/react';

import ColorSlider from './ColorSlider';

const defaultProps = {
  value: 50,
  min: 0,
  max: 100,
  onValueChange: jest.fn(),
  background: 'linear-gradient(to right, #fff, #000)',
  thumbColor: '#808080',
  ariaLabel: 'Test slider',
};

describe('ColorSlider', () => {
  it('renders with the given aria-label', () => {
    render(<ColorSlider {...defaultProps} />);
    expect(
      screen.getByRole('slider', { name: 'Test slider' }),
    ).toBeInTheDocument();
  });

  it('renders with the correct initial value', () => {
    render(<ColorSlider {...defaultProps} value={30} />);
    const slider = screen.getByRole('slider', { name: 'Test slider' });
    expect(slider).toHaveValue('30');
  });

  it('calls onValueChange with numeric value when range input changes', () => {
    const onValueChange = jest.fn();
    render(<ColorSlider {...defaultProps} onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider', { name: 'Test slider' });
    fireEvent.change(slider, { target: { value: '75' } });
    expect(onValueChange).toHaveBeenCalledWith(75);
  });

  it('applies the background style to the range input', () => {
    const bg = 'linear-gradient(to right, red, blue)';
    render(<ColorSlider {...defaultProps} background={bg} />);
    const slider = screen.getByRole('slider', { name: 'Test slider' });
    expect(slider).toHaveStyle({ background: bg });
  });

  it('respects min and max attributes', () => {
    render(<ColorSlider {...defaultProps} min={10} max={360} value={180} />);
    const slider = screen.getByRole('slider', { name: 'Test slider' });
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '360');
  });
});
