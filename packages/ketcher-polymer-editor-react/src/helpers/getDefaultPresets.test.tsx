/* eslint-disable jest/expect-expect */
/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import { getDefaultPresets } from './getDefaultPreset';
import { MonomerItemType } from 'components/monomerLibrary/monomerLibraryItem/types';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import {
  monomers,
  phosphate,
  ribose,
  cytosine,
  guanine,
  thymine,
  uracil,
  adenine,
} from '../testMockData/monomerPresets';

describe('getDefaultPreset function', () => {
  it('should return empty array if cannot return default nucteotides', () => {
    const testArr = getDefaultPresets(monomers);
    expect(testArr).toBeEmptyArray();
  });

  it('should return array of default presets from monomers', () => {
    const monomerData: MonomerItemType[] = [
      ...monomers,
      phosphate,
      ribose,
      cytosine,
      guanine,
      thymine,
      uracil,
      adenine,
    ];

    const thymineNucleotide: IRnaPreset = {
      name: 'T',
      base: thymine,
      sugar: ribose,
      phosphate,
    };

    const guanineNucleotide: IRnaPreset = {
      name: 'G',
      base: guanine,
      sugar: ribose,
      phosphate,
    };

    const testArr = getDefaultPresets(monomerData);
    expect(testArr).toContainEqual(thymineNucleotide);
    expect(testArr).toContainEqual(guanineNucleotide);
    expect(testArr).toContainEqual(
      expect.not.objectContaining({
        MonomerName: '3FAM',
        Name: '3-FAM',
      }),
    );
    expect(testArr).toContainEqual(
      expect.objectContaining({
        MonomerName: 'G',
        Name: 'Guanine',
      }),
    );
  });
});
