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
import cloneDeep from 'lodash/cloneDeep';
import { Nucleotide, Phosphate, RNABase, Sugar } from 'ketcher-core';
import { generateSequenceContextMenuProps } from 'components/contextMenu/SequenceItemContextMenu/helpers';

const instanceOfNode = Object.create(Nucleotide.prototype);
const instanceOfRNABase = Object.create(RNABase.prototype);
const instanceOfSugar = Object.create(Sugar.prototype);
const instanceOfPhosphate = Object.create(Phosphate.prototype);

const nodeNucleotideFirstInChain = cloneDeep(
  Object.assign(instanceOfNode, {
    phosphate: Object.assign(instanceOfPhosphate, {
      monomerItem: {
        label: 'P',
      },
    }),
    rnaBase: Object.assign(instanceOfRNABase, {
      monomerItem: {
        label: 'A',
      },
    }),
    sugar: Object.assign(instanceOfSugar, {
      attachmentPointsToBonds: {
        R1: null,
      },
      monomerItem: {
        label: 'R',
      },
    }),
  }),
);

const nodeNucleotideNotFirstInChain = cloneDeep(
  Object.assign(instanceOfNode, {
    phosphate: Object.assign(instanceOfPhosphate, {
      monomerItem: {
        label: 'P',
      },
    }),
    rnaBase: Object.assign(instanceOfRNABase, {
      monomerItem: {
        label: 'C',
      },
    }),
    sugar: Object.assign(instanceOfSugar, {
      attachmentPointsToBonds: {
        R1: {
          id: 1,
        },
      },
      monomerItem: {
        label: 'R',
      },
    }),
  }),
);

const nodeMonomerInChain = {
  monomer: {
    monomerItem: {
      label: 'P',
    },
  },
};

const mockedSelectionsFirstNucleotide = [
  [
    {
      node: nodeNucleotideFirstInChain,
      nodeIndexOverall: 0,
    },
  ],
];

const mockedSelectionsNotFirstNucleotide = [
  [
    {
      node: nodeNucleotideNotFirstInChain,
      nodeIndexOverall: 1,
    },
  ],
];

const mockedSelections2Nucleotides = [
  [
    {
      node: nodeNucleotideFirstInChain,
      nodeIndexOverall: 0,
    },
    {
      node: nodeNucleotideNotFirstInChain,
      nodeIndexOverall: 1,
    },
  ],
];

const mockedSelections3Elements = [
  [
    {
      node: nodeNucleotideFirstInChain,
      nodeIndexOverall: 0,
    },
    {
      node: nodeNucleotideNotFirstInChain,
      nodeIndexOverall: 1,
    },
    {
      node: nodeMonomerInChain,
      nodeIndexOverall: 2,
    },
  ],
];

describe('SequenceItemContextMenu helpers', () => {
  it('should return undefined if no entry data', () => {
    const result = generateSequenceContextMenuProps();
    expect(result).toBeUndefined();
  });

  it('should return correct data for first in chain selected Nucleotide', () => {
    const result = generateSequenceContextMenuProps(
      mockedSelectionsFirstNucleotide,
    );
    const expectedResult = {
      title: 'R(A)P',
      isSelectedAtLeastOneNucleotide: true,
      isSelectedOnlyNucleotides: true,
      isSequenceFirstsOnlyNucleotidesSelected: true,
      selectedSequenceLabeledNucleotides: [
        {
          baseLabel: 'A',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 0,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return correct data for not first in chain selected Nucleotide', () => {
    const result = generateSequenceContextMenuProps(
      mockedSelectionsNotFirstNucleotide,
    );
    const expectedResult = {
      title: 'R(C)P',
      isSelectedAtLeastOneNucleotide: true,
      isSelectedOnlyNucleotides: true,
      isSequenceFirstsOnlyNucleotidesSelected: false,
      selectedSequenceLabeledNucleotides: [
        {
          baseLabel: 'C',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 1,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return correct data for two selected Nucleotides', () => {
    const result = generateSequenceContextMenuProps(
      mockedSelections2Nucleotides,
    );
    const expectedResult = {
      title: '2 nucleotides',
      isSelectedAtLeastOneNucleotide: true,
      isSelectedOnlyNucleotides: true,
      isSequenceFirstsOnlyNucleotidesSelected: false,
      selectedSequenceLabeledNucleotides: [
        {
          baseLabel: 'A',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 0,
        },
        {
          baseLabel: 'C',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 1,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return correct data for three selected elements', () => {
    const result = generateSequenceContextMenuProps(mockedSelections3Elements);
    const expectedResult = {
      title: '3 elements',
      isSelectedAtLeastOneNucleotide: true,
      isSelectedOnlyNucleotides: false,
      isSequenceFirstsOnlyNucleotidesSelected: false,
      selectedSequenceLabeledNucleotides: [
        {
          baseLabel: 'A',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 0,
        },
        {
          baseLabel: 'C',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 1,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });
});
