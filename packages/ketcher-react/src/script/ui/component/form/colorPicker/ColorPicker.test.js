import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ColorPicker from './ColorPicker';
import { useSettings } from 'src/hooks';

jest.mock('src/hooks', () => ({
  useSettings: jest.fn(),
}));

const defaultProps = {
  value: '#000000',
  name: 'testname',
  onChange: jest.fn(),
};

let mockSettings;
let mockUpdateSettings;

const renderColorPicker = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<ColorPicker {...mergedProps} />);
};

beforeEach(() => {
  mockSettings = { colorPickerCustomColors: [] };
  mockUpdateSettings = jest.fn().mockResolvedValue({});
  useSettings.mockReturnValue({
    settings: mockSettings,
    updateSettings: mockUpdateSettings,
  });
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

  it('should persist custom colors via SettingsService', async () => {
    renderColorPicker({ value: '#123456' });
    await openPreset();

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        colorPickerCustomColors: expect.arrayContaining(['#123456']),
      }),
    );
  });

  it('should restore custom colors from SettingsService', async () => {
    mockSettings.colorPickerCustomColors = ['#123456', '#ABCDEF'];

    renderColorPicker();
    await openPreset();

    expect(screen.getByRole('button', { name: '#123456' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#ABCDEF' })).toBeInTheDocument();
  });

  it('should ignore preset colors from SettingsService custom list', async () => {
    mockSettings.colorPickerCustomColors = ['#8080FF', '#123456'];

    renderColorPicker();
    await openPreset();

    const duplicatedPresetCustomSwatch = screen
      .queryAllByRole('button', { name: '#8080FF' })
      .find((button) => button.className.includes('customSwatch'));

    expect(duplicatedPresetCustomSwatch).toBeUndefined();
    expect(screen.getByRole('button', { name: '#123456' })).toBeInTheDocument();
  });

  it('should read custom colors from SettingsService on every picker open', async () => {
    mockSettings.colorPickerCustomColors = ['#123456'];

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

    mockSettings.colorPickerCustomColors = ['#ABCDEF'];
    useSettings.mockReturnValue({
      settings: mockSettings,
      updateSettings: mockUpdateSettings,
    });

    await userEvent.click(screen.getByTestId('picker-b-color-picker-preview'));
    expect(screen.getByRole('button', { name: '#ABCDEF' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '#123456' })).toBeNull();
  });
});

describe('Cancel and Apply actions', () => {
  it('should NOT call onChange when Cancel is clicked', async () => {
    const onChange = jest.fn();
    renderColorPicker({ onChange });
    await openPreset();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should close the popup when Cancel is clicked', async () => {
    renderColorPicker();
    await openPreset();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(
        screen.queryByTestId('color-picker-preset'),
      ).not.toBeInTheDocument(),
    );
  });

  it('should call onChange with the preset color when a swatch is clicked and Apply is pressed', async () => {
    const onChange = jest.fn();
    renderColorPicker({ onChange });
    await openPreset();
    // Click the first swatch in the preset grid (#B2B2FF)
    await userEvent.click(screen.getByRole('button', { name: '#B2B2FF' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledWith('#B2B2FF');
  });

  it('should close the popup after Apply', async () => {
    renderColorPicker();
    await openPreset();
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(
        screen.queryByTestId('color-picker-preset'),
      ).not.toBeInTheDocument(),
    );
  });
});

describe('Keyboard interactions', () => {
  it('should close the popup when Escape is pressed', async () => {
    renderColorPicker();
    await openPreset();
    expect(screen.getByTestId('color-picker-preset')).toBeInTheDocument();
    // Escape fires on the trigger button; the event bubbles up to the wrapper's keydown handler
    const trigger = screen.getByTestId('testname-color-picker-preview');
    fireEvent.keyDown(trigger, { key: 'Escape' });
    await waitFor(() =>
      expect(
        screen.queryByTestId('color-picker-preset'),
      ).not.toBeInTheDocument(),
    );
  });
});

describe('Hex input validation', () => {
  it('should strip non-hex characters from the hex input', async () => {
    renderColorPicker();
    await openPreset();
    await openPalette();
    const hexInput = screen.getByTestId('color-picker-input');
    fireEvent.change(hexInput, { target: { value: 'GG!!ZZ' } });
    // All non-hex characters removed → empty string
    expect(hexInput.value).toBe('');
  });

  it('should not apply color for partial hex input (fewer than 6 chars)', async () => {
    const onChange = jest.fn();
    renderColorPicker({ onChange });
    await openPreset();
    await openPalette();
    const hexInput = screen.getByTestId('color-picker-input');
    fireEvent.change(hexInput, { target: { value: 'FF00' } });
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    // onChange should be called with the last valid pending color, not the partial input
    expect(onChange).not.toHaveBeenCalledWith(expect.stringMatching(/^#FF00/));
  });

  it('should apply color when exactly 6 valid hex chars are typed', async () => {
    const onChange = jest.fn();
    renderColorPicker({ onChange });
    await openPreset();
    await openPalette();
    const hexInput = screen.getByTestId('color-picker-input');
    fireEvent.change(hexInput, { target: { value: 'AABBCC' } });
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledWith('#AABBCC');
  });
});

describe('Delete custom color', () => {
  it('should remove selected custom color and update settings', async () => {
    // value #123456 is not a preset, so it will be added to custom colors on open
    renderColorPicker({ value: '#123456' });
    await openPreset();
    // The delete button lives inside the custom panel — open it first
    await openPalette();

    const deleteBtn = screen.getByRole('button', {
      name: 'Delete custom color',
    });
    expect(deleteBtn).not.toBeDisabled();

    await userEvent.click(deleteBtn);
    expect(mockUpdateSettings).toHaveBeenLastCalledWith({
      colorPickerCustomColors: [],
    });
    // Swatch is removed from the UI
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: '#123456' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('should disable the delete button when no custom color is selected', async () => {
    // value #FF0000 is a preset color → not added to custom colors → delete disabled
    renderColorPicker({ value: '#FF0000' });
    await openPreset();
    await openPalette();
    const deleteBtn = screen.getByRole('button', {
      name: 'Delete custom color',
    });
    expect(deleteBtn).toBeDisabled();
  });
});
