/****************************************************************************
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { renderHook } from '@testing-library/react';
import { KetMonomerClass, MonomerItemType, Struct } from 'ketcher-core';
import { MONOMER_TYPES, MonomerGroups } from 'src/constants';
import { useAppSelector } from 'hooks';
import { selectFilteredMonomers } from 'state/library';
import { selectFilteredPresets } from 'state/rna-builder';
import { useGroupsData } from './useGroupsData';

jest.mock('hooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockUseAppSelector = useAppSelector as jest.Mock;

const createPhosphateMonomer = (
  code: string,
  label = code,
): MonomerItemType => ({
  label,
  props: {
    MonomerNaturalAnalogCode: code,
    MonomerName: code,
    Name: `Phosphate ${code}`,
    MonomerType: MONOMER_TYPES.RNA,
    MonomerClass: KetMonomerClass.Phosphate,
    BranchMonomer: '',
    MonomerCaps: {},
    MonomerCode: code,
  },
  struct: new Struct(),
});

describe('useGroupsData', () => {
  afterEach(() => {
    mockUseAppSelector.mockReset();
  });

  it('collapses phosphate groups into a single group', () => {
    const monomers = [
      createPhosphateMonomer('P', 'P'),
      createPhosphateMonomer('Q', 'Q'),
    ];

    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === selectFilteredMonomers) {
        return monomers;
      }
      if (selector === selectFilteredPresets) {
        return [];
      }
      return undefined;
    });

    const { result } = renderHook(() => useGroupsData(MONOMER_TYPES.RNA));
    const phosphateGroup = result.current.find(
      (group) => group.groupName === MonomerGroups.PHOSPHATES,
    );
    const phosphateGroupItems = phosphateGroup?.groups[0]?.groupItems as
      | MonomerItemType[]
      | undefined;

    expect(phosphateGroup).toBeDefined();
    expect(phosphateGroup?.groups).toHaveLength(1);
    expect(phosphateGroupItems).toHaveLength(2);
  });
});
