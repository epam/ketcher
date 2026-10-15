import { renderHook } from '@testing-library/react';
import {
  IKetMonomerGroupTemplate,
  KetMonomerGroupTemplateClass,
  KetTemplateType,
} from 'ketcher-core';
import { getPresets } from 'helpers';
import { selectEditor } from 'state/common';
import { selectDefaultRnaPresets } from 'state/library';
import { useAppDispatch, useAppSelector } from './stateHooks';
import useSetRnaPresets from './useSetRnaPresets';

jest.mock('./stateHooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('helpers', () => ({
  ...jest.requireActual('helpers'),
  getPresets: jest.fn(() => []),
}));

jest.mock('helpers/manipulateCachedRnaPresets', () => ({
  getCachedCustomRnaPresets: jest.fn(() => null),
  setCachedCustomRnaPreset: jest.fn(),
}));

const mockUseAppSelector = jest.mocked(useAppSelector);
const mockGetPresets = jest.mocked(getPresets);

const createPreset = (
  name: string,
  hidden?: boolean,
): IKetMonomerGroupTemplate => ({
  type: KetTemplateType.MONOMER_GROUP_TEMPLATE,
  id: name,
  name,
  class: KetMonomerGroupTemplateClass.RNA,
  templates: [],
  ...(hidden ? { hidden } : {}),
});

const visiblePreset = createPreset('MOE(A)P');
const hiddenPreset = createPreset('dR(A)P', true);

const renderWithPresets = (
  storePresets: IKetMonomerGroupTemplate[],
  libraryPresets: IKetMonomerGroupTemplate[],
) => {
  const editor = {
    monomersLibrary: [],
    defaultRnaPresetsLibraryItems: libraryPresets,
  };
  mockUseAppSelector.mockImplementation((selector) => {
    if (selector === selectEditor) return editor;
    if (selector === selectDefaultRnaPresets) return storePresets;
    return undefined;
  });

  renderHook(() => useSetRnaPresets());
};

describe('useSetRnaPresets', () => {
  beforeEach(() => {
    jest.mocked(useAppDispatch).mockReturnValue(jest.fn());
    mockGetPresets.mockClear();
  });

  it('does not show hidden presets from the library', () => {
    renderWithPresets([], [visiblePreset, hiddenPreset]);

    expect(mockGetPresets).toHaveBeenCalledWith([], [visiblePreset], true);
  });

  it('does not show hidden presets from the store', () => {
    renderWithPresets([visiblePreset, hiddenPreset], []);

    expect(mockGetPresets).toHaveBeenCalledWith([], [visiblePreset], true);
  });
});
