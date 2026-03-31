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
import {
  AttachmentPointName,
  getRnaPresetPhosphatePosition,
  KetConnectionType,
  MonomerItemType,
} from 'ketcher-core';

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

    const testArr = getPresets(monomerData, rnaPresetsTemplates, true);

    expect(testArr).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'T',
          base: thymine,
          sugar: ribose,
          phosphate,
          default: true,
        }),
        expect.objectContaining({
          name: 'G',
          base: guanine,
          sugar: ribose,
          phosphate,
          default: true,
        }),
      ]),
    );

    expect(testArr.find(({ name }) => name === '3FAM')).toBeUndefined();
  });

  it('should infer left phosphate position from preset connections', () => {
    const phosphateWithId = {
      ...phosphate,
      props: {
        ...phosphate.props,
        id: 'P___Phosphate',
      },
    };
    const riboseWithId = {
      ...ribose,
      props: {
        ...ribose.props,
        id: 'R___Ribose',
      },
    };
    const adenineWithId = {
      ...adenine,
      props: {
        ...adenine.props,
        id: 'A___Adenine',
      },
    };
    const monomerData: MonomerItemType[] = [
      phosphateWithId,
      riboseWithId,
      adenineWithId,
    ];
    const leftPreset = getPresets(
      monomerData,
      [
        {
          ...rnaPresetsTemplates[0],
          connections: [
            {
              connectionType: KetConnectionType.SINGLE,
              endpoint1: {
                templateId: 'monomerTemplate-R___Ribose',
                attachmentPointId: AttachmentPointName.R1,
              },
              endpoint2: {
                templateId: 'monomerTemplate-P___Phosphate',
                attachmentPointId: AttachmentPointName.R2,
              },
            },
          ],
        },
      ],
      true,
    )[0];

    expect(getRnaPresetPhosphatePosition(leftPreset)).toBe('left');
  });
});
