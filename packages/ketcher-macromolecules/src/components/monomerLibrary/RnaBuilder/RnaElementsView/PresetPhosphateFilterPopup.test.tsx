import { fireEvent, render, screen } from '@testing-library/react';
import { PresetPhosphateFilterPopup } from './PresetPhosphateFilterPopup';

describe('PresetPhosphateFilterPopup', () => {
  it('toggles false and true flag values in both directions', () => {
    render(
      withThemeAndStoreProvider(
        <PresetPhosphateFilterPopup onClose={jest.fn()} />,
        {
          rnaBuilder: {
            presetPhosphateFilter: {
              fivePrime: false,
              threePrime: true,
              noPhosphate: false,
            },
          },
        },
      ),
    );

    const fivePrime = screen.getByTestId('preset-filter-5-phosphate');
    const threePrime = screen.getByTestId('preset-filter-3-phosphate');
    expect(fivePrime).not.toBeChecked();
    expect(threePrime).toBeChecked();

    fireEvent.click(fivePrime);
    fireEvent.click(threePrime);
    expect(fivePrime).toBeChecked();
    expect(threePrime).not.toBeChecked();

    fireEvent.click(fivePrime);
    fireEvent.click(threePrime);
    expect(fivePrime).not.toBeChecked();
    expect(threePrime).toBeChecked();
  });
});
