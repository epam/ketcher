import { render, screen } from '@testing-library/react';
import { RnaPresetGroup } from './RnaPresetGroup';
import { preset } from 'src/testMockData/monomerPresets';

const duplicatePreset = jest.fn();
const editPreset = jest.fn();
describe('Test Rna Preset Group component', () => {
  it('groups presets by phosphate position', () => {
    const presetWithLeftPhosphate = {
      ...preset,
      name: 'U-5',
      connections: [],
      phosphatePosition: 'left' as const,
    };
    const presetWithRightPhosphate = {
      ...preset,
      name: 'U-3',
      connections: [],
      phosphatePosition: 'right' as const,
    };
    const presetWithoutPhosphate = {
      ...preset,
      name: 'U-no-p',
      phosphate: undefined,
      connections: [],
      phosphatePosition: undefined,
    };

    render(
      withThemeAndStoreProvider(
        <RnaPresetGroup
          presets={[
            presetWithLeftPhosphate,
            presetWithRightPhosphate,
            presetWithoutPhosphate,
          ]}
          duplicatePreset={duplicatePreset}
          editPreset={editPreset}
        />,
      ),
    );

    expect(
      screen.getByText("Presets with phosphate on the 5' end"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('rna-preset-group-five-prime-phosphate'),
    ).toHaveTextContent('U-5');
    expect(
      screen.getByText("Presets with phosphate on the 3' end"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('rna-preset-group-three-prime-phosphate'),
    ).toHaveTextContent('U-3');
    expect(screen.getByText('Presets without phosphate')).toBeInTheDocument();
    expect(
      screen.getByTestId('rna-preset-group-without-phosphate'),
    ).toHaveTextContent('U-no-p');
  });
});
