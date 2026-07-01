import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ColorPicker from './ColorPicker';

const defaultProps = {
  value: '#000000',
  name: 'testname',
  onChange: jest.fn(),
};

const customColorsStorageKey = 'ketcher_color_picker_custom_colors';

const renderColorPicker = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<ColorPicker {...mergedProps} />);
};

beforeEach(() => {
  localStorage.clear();
});

const openPreset = async () => {
  const presetToggleBtn = screen.getByTestId('testname-color-picker-preview');
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
    const overlay = screen.getByTestId('color-picker-field-open');
    await new Promise((resolve) => {
      setTimeout(() => {
        userEvent.click(overlay);
        resolve();
      }, 1000);
    });
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
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledWith('#4D4D4D');
  });

  it('should display picked color correctly', () => {
    renderColorPicker();
    expect(
      screen.getByTestId('testname-color-picker-preview').style.backgroundColor,
    ).toBe('rgb(0, 0, 0)');
  });

  it('should highlight selected custom color when dialog opens', async () => {
    renderColorPicker({ value: '#123456' });

    await openPreset();

    const customSwatch = screen.getByRole('button', { name: '#123456' });
    expect(customSwatch.className).toContain('swatchSelected');
  });

  it('should persist custom colors in localStorage', async () => {
    renderColorPicker({ value: '#123456' });
    await openPreset();

    const storedColors = JSON.parse(
      localStorage.getItem(customColorsStorageKey) || '[]',
    );

    expect(storedColors).toContain('#123456');
  });

  it('should restore custom colors from localStorage', async () => {
    localStorage.setItem(
      customColorsStorageKey,
      JSON.stringify(['#123456', '#ABCDEF']),
    );

    renderColorPicker();
    await openPreset();

    expect(screen.getByRole('button', { name: '#123456' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#ABCDEF' })).toBeInTheDocument();
  });

  it('should ignore preset colors from localStorage custom list', async () => {
    localStorage.setItem(
      customColorsStorageKey,
      JSON.stringify(['#0095FF', '#123456']),
    );

    renderColorPicker();
    await openPreset();

    const duplicatedPresetCustomSwatch = screen
      .queryAllByRole('button', { name: '#0095FF' })
      .find((button) => button.className.includes('customSwatch'));

    expect(duplicatedPresetCustomSwatch).toBeUndefined();
    expect(screen.getByRole('button', { name: '#123456' })).toBeInTheDocument();
  });

  it('should read custom colors from localStorage on every picker open', async () => {
    localStorage.setItem(customColorsStorageKey, JSON.stringify(['#123456']));

    render(
      <>
        <ColorPicker value="#000000" name="picker-a" onChange={jest.fn()} />
        <ColorPicker value="#000000" name="picker-b" onChange={jest.fn()} />
      </>,
    );

    await userEvent.click(screen.getByTestId('picker-a-color-picker-preview'));
    expect(screen.getByRole('button', { name: '#123456' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(
        screen.queryByTestId('color-picker-preset'),
      ).not.toBeInTheDocument(),
    );

    localStorage.setItem(customColorsStorageKey, JSON.stringify(['#ABCDEF']));

    await userEvent.click(screen.getByTestId('picker-b-color-picker-preview'));
    expect(screen.getByRole('button', { name: '#ABCDEF' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '#123456' })).toBeNull();
  });
});
