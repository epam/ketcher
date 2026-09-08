import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PresetGrid from './PresetGrid';
import { presetColors } from './ColorPicker.constants';

describe('PresetGrid', () => {
  it('renders a swatch button for every preset color', () => {
    render(<PresetGrid selectedColor="#FF3232" onSelectColor={jest.fn()} />);
    presetColors.forEach((color) => {
      expect(screen.getByRole('button', { name: color })).toBeInTheDocument();
    });
  });

  it('highlights the swatch matching the selected color', () => {
    render(<PresetGrid selectedColor="#ff3232" onSelectColor={jest.fn()} />);
    expect(screen.getByRole('button', { name: '#FF3232' }).className).toContain(
      'swatchSelected',
    );
  });

  it('calls onSelectColor with the clicked color', async () => {
    const onSelectColor = jest.fn();
    render(
      <PresetGrid selectedColor="#FF3232" onSelectColor={onSelectColor} />,
    );
    await userEvent.click(screen.getByRole('button', { name: '#000099' }));
    expect(onSelectColor).toHaveBeenCalledWith('#000099');
  });
});
