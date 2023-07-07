import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ColorPicker from './ColorPicker';

const openPreset = async () => {
  const presetToggleBtn = screen.getByTestId('color-picker-preview');
  userEvent.click(presetToggleBtn);
  const preset = await screen.findByTestId('color-picker-preset');
  await waitFor(() => expect(preset).toBeInTheDocument());
};
const openPalette = async () => {
  const pickerToggleBtn = screen.getByTestId('color-picker-btn');
  userEvent.click(pickerToggleBtn);
  const palette = await screen.findByTestId('color-palette');
  await waitFor(() => expect(palette).toBeInTheDocument());
};

describe('should be rendered correctly', () => {
  it('should be rendered without crashing', () => {
    const { asFragment } = render(<ColorPicker value="#000000" />);
    expect(asFragment(<ColorPicker />)).toMatchSnapshot();
  });
});

describe('should toggle color picker dialog', () => {
  it('should show color preset on click', async () => {
    const { container } = render(<ColorPicker />);
    await openPreset();
    expect(
      container.getElementsByClassName('classes.colorPickerWrap')
    ).toBeDefined();
  });

  it('should show color picker dialog on click', async () => {
    const { container } = render(<ColorPicker />);
    await openPreset();
    await openPalette();
    expect(container.getElementsByClassName('react-colorful')[0]).toBeDefined();
  });

  it('should hide color picker dialog on click outside picker', async () => {
    const { container } = render(<ColorPicker />);
    await openPreset();
    await openPalette();
    const overlay = screen.getByTestId('color-picker-field-open');
    await new Promise((resolve) => {
      setTimeout(() => {
        userEvent.click(overlay);
        resolve();
      }, 300);
    });
    expect(await screen.findByTestId('color-picker-field')).toBeInTheDocument();

    expect(
      container.getElementsByClassName('react-colorful')[0]
    ).toBeUndefined();
  });
});

describe('should pick color correctly', () => {
  it('should call onChange callback with picked color', async () => {
    const onChange = jest.fn();
    render(<ColorPicker onChange={onChange} />);
    await openPreset();
    await openPalette();
    const colorInput = screen.getByTestId('color-picker-input');
    fireEvent.change(colorInput, { target: { value: '#4d4d4d' } });
    expect(onChange).toBeCalledWith('#4d4d4d');
  });

  it('should display picked color correctly', () => {
    render(<ColorPicker value="#000000" />);
    expect(
      screen.getByTestId('color-picker-preview').style.backgroundColor
    ).toBe('rgb(0, 0, 0)');
  });
});
