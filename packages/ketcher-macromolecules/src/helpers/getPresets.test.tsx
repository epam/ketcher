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

import { getPresets } from './getPreset';
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
  rnaPresetsTemplates,
} from '../testMockData/monomerPresets';
import { MonomerItemType } from 'ketcher-core';

describe('getPreset function', () => {
  it('should return empty array if cannot return default nucteotides', () => {
    const testArr = getPresets(monomers, [], true);
    expect(testArr.length).toEqual(0);
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
      default: true,
    };

    const guanineNucleotide: IRnaPreset = {
      name: 'G',
      base: guanine,
      sugar: ribose,
      phosphate,
      default: true,
    };

    const testArr = getPresets(monomerData, rnaPresetsTemplates, true);

    expect(testArr).toContainEqual(thymineNucleotide);
    expect(testArr).toContainEqual(guanineNucleotide);
    expect(testArr).not.toContainEqual({
      MonomerName: '3FAM',
      Name: '3-FAM',
    });
  });
});
