import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ColorPicker from './ColorPicker';

const defaultProps = {
  name: 'test-color',
  value: '#000000',
  onChange: jest.fn(),
};

const renderColorPicker = (props = {}) =>
  render(<ColorPicker {...defaultProps} {...props} />);

const openPreset = async () => {
  const presetToggleBtn = screen.getByTestId('test-color-color-picker-preview');
  await userEvent.click(presetToggleBtn);
  const preset = await screen.findByTestId('color-picker-preset');
  await waitFor(() => expect(preset).toBeInTheDocument());
};

const openPalette = async () => {
  const pickerToggleBtn = screen.getByTestId('color-picker-btn');
  await userEvent.click(pickerToggleBtn);
  const palette = await screen.findByTestId('color-palette');
  await waitFor(() => expect(palette).toBeInTheDocument());
};

describe('should be rendered correctly', () => {
  it('should be rendered without crashing', () => {
    const { asFragment } = renderColorPicker();
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('should toggle color picker dialog', () => {
  it('should show color preset on click', async () => {
    renderColorPicker();
    await openPreset();
    expect(screen.getByTestId('color-picker-preset')).toBeInTheDocument();
  });

  it('should render the popup outside the field wrapper', async () => {
    const { container } = renderColorPicker();
    await openPreset();

    expect(screen.getByTestId('color-picker-preset').parentElement).toBe(
      document.body,
    );
    expect(container).not.toContainElement(
      screen.getByTestId('color-picker-preset'),
    );
  });

  it('should show color picker dialog on click', async () => {
    renderColorPicker();
    await openPreset();
    await openPalette();
    expect(screen.getByTestId('color-palette')).toBeInTheDocument();
  });

  it('should hide color picker dialog on click outside picker', async () => {
    renderColorPicker();
    await openPreset();
    await openPalette();
    fireEvent.mouseDown(document.body);
    expect(await screen.findByTestId('color-picker-field')).toBeInTheDocument();
    expect(screen.queryByTestId('color-palette')).not.toBeInTheDocument();
  });
});

describe('should pick color correctly', () => {
  it('should call onChange callback with picked color', async () => {
    const onChange = jest.fn();
    renderColorPicker({ onChange });
    await openPreset();
    await openPalette();
    const colorInput = screen.getByTestId('color-picker-input');
    fireEvent.change(colorInput, { target: { value: '4d4d4d' } });
    expect(onChange).not.toBeCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toBeCalledWith('#4d4d4d');
  });

  it('should display picked color correctly', () => {
    renderColorPicker({ value: '#000000', name: 'testname' });
    expect(
      screen.getByTestId('testname-color-picker-preview').style.backgroundColor,
    ).toBe('rgb(0, 0, 0)');
  });

  it('should discard unapplied custom color changes on cancel', async () => {
    const onChange = jest.fn();

    renderColorPicker({ onChange, value: '#123456' });
    await openPreset();
    await openPalette();
    fireEvent.change(screen.getByTestId('color-picker-input'), {
      target: { value: 'ff3232' },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onChange).not.toBeCalled();
    expect(
      screen.getByTestId('test-color-color-picker-preview').style
        .backgroundColor,
    ).toBe('rgb(18, 52, 86)');
  });

  it('should clear custom color input without crashing', async () => {
    renderColorPicker({ value: '#ff3232' });
    await openPreset();
    await openPalette();
    await userEvent.click(screen.getByTestId('clear-custom-color-button'));

    expect(screen.getByTestId('color-picker-input')).toHaveValue('');
  });
});
