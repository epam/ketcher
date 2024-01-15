import { render, screen } from '@testing-library/react';
import { RnaPresetGroup } from './RnaPresetGroup';
import { preset } from 'src/testMockData/monomerPresets';

const duplicatePreset = jest.fn();
const editPreset = jest.fn();
describe('Test Rna Preset Group component', () => {
  it('should render', () => {
    render(
      withThemeAndStoreProvider(
        <RnaPresetGroup
          presets={[preset]}
          duplicatePreset={duplicatePreset}
          editPreset={editPreset}
        />,
      ),
    );

    const rnaPresetGroup = screen.getByTestId('rna-preset-group');

    expect(rnaPresetGroup).toMatchSnapshot();
  });
});
