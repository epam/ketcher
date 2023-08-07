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
import { Struct } from 'ketcher-core';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';

describe('getDefaultPreset function', () => {
  it('should return empty array if cannot return default nucteotides', () => {
    const monomers: MonomerItemType[] = [
      {
        props: {
          MonomerName: '12ddR',
          Name: "1',2'-Di-Deoxy-Ribose",
          MonomerNaturalAnalogCode: '',
          MonomerType: '',
          BranchMonomer: '',
          MonomerCaps: '',
          MonomerCode: '',
        },
        label: '',
        struct: new Struct(),
      },
      {
        props: {
          MonomerName: '3A6',
          Name: "6-amino-hexanol (3' end)",
          MonomerNaturalAnalogCode: '',
          MonomerType: '',
          BranchMonomer: '',
          MonomerCaps: '',
          MonomerCode: '',
        },
        label: '',
        struct: new Struct(),
      },
      {
        props: {
          MonomerName: '3FAM',
          Name: '3-FAM',
          MonomerNaturalAnalogCode: '',
          MonomerType: '',
          BranchMonomer: '',
          MonomerCaps: '',
          MonomerCode: '',
        },
        label: '',
        struct: new Struct(),
      },
      {
        props: {
          MonomerName: '4sR',
          Name: '4-Thio-Ribose',
          MonomerNaturalAnalogCode: '',
          MonomerType: '',
          BranchMonomer: '',
          MonomerCaps: '',
          MonomerCode: '',
        },
        label: '',
        struct: new Struct(),
      },
    ];

    const testArr = getDefaultPresets(monomers);
    expect(testArr).toBeEmptyArray();
  });

  it('should return array of default presets from monomers', () => {
    const phosphate = {
      props: {
        MonomerName: 'P',
        Name: 'Phosphate',
        MonomerNaturalAnalogCode: '',
        MonomerType: '',
        BranchMonomer: '',
        MonomerCaps: '',
        MonomerCode: '',
      },
      label: '',
      struct: new Struct(),
    };
    const ribose = {
      props: {
        MonomerName: 'R',
        Name: 'Ribose',
        MonomerNaturalAnalogCode: '',
        MonomerType: '',
        BranchMonomer: '',
        MonomerCaps: '',
        MonomerCode: '',
      },
      label: '',
      struct: new Struct(),
    };
    const thymine = {
      props: {
        MonomerName: 'T',
        Name: 'Thymine',
        MonomerNaturalAnalogCode: '',
        MonomerType: '',
        BranchMonomer: '',
        MonomerCaps: '',
        MonomerCode: '',
      },
      label: '',
      struct: new Struct(),
    };
    const cytosine = {
      props: {
        MonomerName: 'C',
        Name: 'Cytosine',
        MonomerNaturalAnalogCode: '',
        MonomerType: '',
        BranchMonomer: '',
        MonomerCaps: '',
        MonomerCode: '',
      },
      label: '',
      struct: new Struct(),
    };
    const uracil = {
      props: {
        MonomerName: 'U',
        Name: 'Uracil',
        MonomerNaturalAnalogCode: '',
        MonomerType: '',
        BranchMonomer: '',
        MonomerCaps: '',
        MonomerCode: '',
      },
      label: '',
      struct: new Struct(),
    };
    const adenine = {
      props: {
        MonomerName: 'A',
        Name: 'Adenine',
        MonomerNaturalAnalogCode: '',
        MonomerType: '',
        BranchMonomer: '',
        MonomerCaps: '',
        MonomerCode: '',
      },
      label: '',
      struct: new Struct(),
    };
    const guanine = {
      props: {
        MonomerName: 'G',
        Name: 'Guanine',
        MonomerNaturalAnalogCode: '',
        MonomerType: '',
        BranchMonomer: '',
        MonomerCaps: '',
        MonomerCode: '',
      },
      label: '',
      struct: new Struct(),
    };
    const monomers: MonomerItemType[] = [
      {
        props: {
          MonomerName: '12ddR',
          Name: "1',2'-Di-Deoxy-Ribose",
          MonomerNaturalAnalogCode: '',
          MonomerType: '',
          BranchMonomer: '',
          MonomerCaps: '',
          MonomerCode: '',
        },
        label: '',
        struct: new Struct(),
      },
      {
        props: {
          MonomerName: '3A6',
          Name: "6-amino-hexanol (3' end)",
          MonomerNaturalAnalogCode: '',
          MonomerType: '',
          BranchMonomer: '',
          MonomerCaps: '',
          MonomerCode: '',
        },
        label: '',
        struct: new Struct(),
      },
      {
        props: {
          MonomerName: '3FAM',
          Name: '3-FAM',
          MonomerNaturalAnalogCode: '',
          MonomerType: '',
          BranchMonomer: '',
          MonomerCaps: '',
          MonomerCode: '',
        },
        label: '',
        struct: new Struct(),
      },
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

    const testArr = getDefaultPresets(monomers);
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
