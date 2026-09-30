import { vi } from 'vitest';
import { withThemeAndStoreProvider } from 'src/testUtils/storeProviders';

import { render, screen, fireEvent } from '@testing-library/react';
import RnaPresetItem from './RnaPresetItem';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';

describe('Test Rna Preset Item component', () => {
  it('Test click event', () => {
    const rnaPresetItemHandleClick = vi.fn();
    const rnaPresetItemHandleContextMenu = vi.fn();
    const rnaPresetItemHandleMouseLeave = vi.fn();
    const rnaPresetItemHandleMouseMove = vi.fn();
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

  it('calls onStarClick when the favorite star is clicked', () => {
    const onStarClick = vi.fn();
    const preset: IRnaPreset = {
      base: undefined,
      name: 'MyRna',
      phosphate: undefined,
      nameInList: undefined,
      sugar: undefined,
    };

    const { container } = render(
      withThemeAndStoreProvider(
        <RnaPresetItem
          isSelected={false}
          onClick={vi.fn()}
          onContextMenu={vi.fn()}
          onMouseLeave={vi.fn()}
          onMouseMove={vi.fn()}
          onStarClick={onStarClick}
          preset={preset}
        />,
      ),
    );

    const star = container.querySelector('.star');
    expect(star).not.toBeNull();
    fireEvent.click(star as Element);

    expect(onStarClick).toHaveBeenCalledTimes(1);
  });
});
