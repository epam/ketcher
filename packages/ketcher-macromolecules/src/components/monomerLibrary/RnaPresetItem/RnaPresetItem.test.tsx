import { render, screen, fireEvent } from '@testing-library/react';
import { RnaPresetItem } from './RnaPresetItem';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';

describe('Test Rna Preset Item component', () => {
  it('Test click event', () => {
    const rnaPresetItemHandleClick = jest.fn();
    const rnaPresetItemHandleContextMenu = jest.fn();
    const rnaPresetItemHandleMouseLeave = jest.fn();
    const rnaPresetItemHandleMouseMove = jest.fn();
    const preset: IRnaPreset = {
      base: undefined,
      name: 'MyRna',
      phosphate: undefined,
      nameInList: undefined,
      sugar: undefined,
    };

    render(
      withThemeAndStoreProvider(
        <RnaPresetItem
          isSelected={false}
          onClick={rnaPresetItemHandleClick}
          onContextMenu={rnaPresetItemHandleContextMenu}
          onMouseLeave={rnaPresetItemHandleMouseLeave}
          onMouseMove={rnaPresetItemHandleMouseMove}
          preset={preset}
        />,
      ),
    );

    const div = screen.getByTestId('MyRna_._._.');
    fireEvent.click(div);

    expect(rnaPresetItemHandleClick.mock.calls.length).toEqual(1);
  });
});
