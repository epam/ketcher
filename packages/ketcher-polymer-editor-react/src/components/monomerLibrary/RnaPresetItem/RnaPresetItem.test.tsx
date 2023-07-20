import { render, screen, fireEvent } from '@testing-library/react';
import { RnaPresetItem } from './RnaPresetItem';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';

describe('Test Rna Preset Item component', () => {
  it('Test click event', () => {
    const rnaPresetItemHandleClick = jest.fn();
    const preset: IRnaPreset = {
      base: undefined,
      name: 'MyRna',
      phosphate: undefined,
      presetInList: undefined,
      sugar: undefined,
    };

    render(
      withThemeAndStoreProvider(
        <RnaPresetItem preset={preset} onClick={rnaPresetItemHandleClick} />,
      ),
    );

    const div = screen.getByTestId(preset.name as string);
    fireEvent.click(div);

    expect(rnaPresetItemHandleClick.mock.calls.length).toEqual(1);
  });
});
