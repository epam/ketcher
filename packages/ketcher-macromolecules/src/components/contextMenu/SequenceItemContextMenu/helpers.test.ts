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
import {
  Nucleotide,
  Nucleoside,
  Phosphate,
  RNABase,
  Sugar,
  MonomerSequenceNode,
  Entities,
} from 'ketcher-core';
import { generateSequenceContextMenuProps } from 'components/contextMenu/SequenceItemContextMenu/helpers';

const instanceOfNucleotide = Object.create(Nucleotide.prototype);
const instanceOfNucleoside = Object.create(Nucleoside.prototype);
const instanceOfMonomerSequenceNode = Object.create(
  MonomerSequenceNode.prototype,
);
const instanceOfRNABase = Object.create(RNABase.prototype);
const instanceOfSugar = Object.create(Sugar.prototype);
const instanceOfPhosphate = Object.create(Phosphate.prototype);

const nodeNucleotideFirstInChain = cloneDeep(
  Object.assign(instanceOfNucleotide, {
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
  Object.assign(instanceOfNucleotide, {
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

const nodeNucleosideNotFirstInChain = cloneDeep(
  Object.assign(instanceOfNucleoside, {
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

const nodeMonomerInChain = cloneDeep(
  Object.assign(instanceOfMonomerSequenceNode, {
    monomer: Object.assign(instanceOfPhosphate, {
      monomerItem: {
        label: 'P',
      },
    }),
  }),
);

const mockedSelectionsFirstNucleotide = [
  [
    {
      node: nodeNucleotideFirstInChain,
      nodeIndexOverall: 0,
      hasR1Connection: false,
    },
  ],
];

const mockedSelectionsNotFirstNucleotide = [
  [
    {
      node: nodeNucleotideNotFirstInChain,
      nodeIndexOverall: 1,
      hasR1Connection: true,
    },
  ],
];

const mockedSelectionsNotFirstNucleoside = [
  [
    {
      node: nodeNucleosideNotFirstInChain,
      nodeIndexOverall: 1,
      hasR1Connection: true,
    },
  ],
];

const mockedSelections2Nucleotides = [
  [
    {
      node: nodeNucleotideFirstInChain,
      nodeIndexOverall: 0,
      hasR1Connection: false,
    },
    {
      node: nodeNucleotideNotFirstInChain,
      nodeIndexOverall: 1,
      hasR1Connection: true,
    },
  ],
];

const mockedSelectionsNucleosideAndPhosphate = [
  [
    {
      node: nodeNucleosideNotFirstInChain,
      nodeIndexOverall: 1,
      isNucleosideConnectedAndSelectedWithPhosphate: true,
      hasR1Connection: true,
    },
    {
      node: nodeMonomerInChain,
      nodeIndexOverall: 2,
    },
  ],
];

const mockedSelectionsPhosphateAndNucleoside = [
  [
    {
      node: nodeMonomerInChain,
      nodeIndexOverall: 2,
    },
    {
      node: nodeNucleosideNotFirstInChain,
      nodeIndexOverall: 3,
      isNucleosideConnectedAndSelectedWithPhosphate: false,
      hasR1Connection: true,
    },
  ],
];

const mockedSelections3Elements = [
  [
    {
      node: nodeNucleotideFirstInChain,
      nodeIndexOverall: 0,
      hasR1Connection: false,
    },
    {
      node: nodeNucleotideNotFirstInChain,
      nodeIndexOverall: 1,
      hasR1Connection: true,
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
      isSelectedAtLeastOneNucleoelement: true,
      isSelectedOnlyNucleoelements: true,
      isSequenceFirstsOnlyNucleoelementsSelected: true,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Nucleotide,
          baseLabel: 'A',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 0,
          hasR1Connection: false,
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
      isSelectedAtLeastOneNucleoelement: true,
      isSelectedOnlyNucleoelements: true,
      isSequenceFirstsOnlyNucleoelementsSelected: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Nucleotide,
          baseLabel: 'C',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 1,
          hasR1Connection: true,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return correct data for not first in chain selected Nucleoside', () => {
    const result = generateSequenceContextMenuProps(
      mockedSelectionsNotFirstNucleoside,
    );
    const expectedResult = {
      title: 'R(C)',
      isSelectedAtLeastOneNucleoelement: true,
      isSelectedOnlyNucleoelements: true,
      isSequenceFirstsOnlyNucleoelementsSelected: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Nucleoside,
          baseLabel: 'C',
          sugarLabel: 'R',
          nodeIndexOverall: 1,
          isNucleosideConnectedAndSelectedWithPhosphate: undefined,
          hasR1Connection: true,
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
      isSelectedAtLeastOneNucleoelement: true,
      isSelectedOnlyNucleoelements: true,
      isSequenceFirstsOnlyNucleoelementsSelected: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Nucleotide,
          baseLabel: 'A',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 0,
          hasR1Connection: false,
        },
        {
          type: Entities.Nucleotide,
          baseLabel: 'C',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 1,
          hasR1Connection: true,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return correct data for connected and selected Nucleoside-Phosphate that can be interpreted as Nucleotide', () => {
    const result = generateSequenceContextMenuProps(
      mockedSelectionsNucleosideAndPhosphate,
    );
    const expectedResult = {
      title: 'R(C)P',
      isSelectedAtLeastOneNucleoelement: true,
      isSelectedOnlyNucleoelements: true,
      isSequenceFirstsOnlyNucleoelementsSelected: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Nucleoside,
          baseLabel: 'C',
          sugarLabel: 'R',
          nodeIndexOverall: 1,
          hasR1Connection: true,
          isNucleosideConnectedAndSelectedWithPhosphate: true,
        },
        {
          type: Entities.Phosphate,
          phosphateLabel: 'P',
          nodeIndexOverall: 2,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return correct data for connected and selected Phosphate-Nucleoside that can not be interpreted as Nucleotide', () => {
    const result = generateSequenceContextMenuProps(
      mockedSelectionsPhosphateAndNucleoside,
    );
    const expectedResult = {
      title: '2 elements',
      isSelectedAtLeastOneNucleoelement: true,
      isSelectedOnlyNucleoelements: false,
      isSequenceFirstsOnlyNucleoelementsSelected: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Phosphate,
          phosphateLabel: 'P',
          nodeIndexOverall: 2,
        },
        {
          type: Entities.Nucleoside,
          baseLabel: 'C',
          sugarLabel: 'R',
          nodeIndexOverall: 3,
          hasR1Connection: true,
          isNucleosideConnectedAndSelectedWithPhosphate: false,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return correct data for three selected elements', () => {
    const result = generateSequenceContextMenuProps(mockedSelections3Elements);
    const expectedResult = {
      title: '3 elements',
      isSelectedAtLeastOneNucleoelement: true,
      isSelectedOnlyNucleoelements: false,
      isSequenceFirstsOnlyNucleoelementsSelected: false,
      selectedSequenceLabeledNodes: [
        {
          baseLabel: 'A',
          nodeIndexOverall: 0,
          phosphateLabel: 'P',
          sugarLabel: 'R',
          type: Entities.Nucleotide,
          hasR1Connection: false,
        },
        {
          baseLabel: 'C',
          nodeIndexOverall: 1,
          phosphateLabel: 'P',
          sugarLabel: 'R',
          type: Entities.Nucleotide,
          hasR1Connection: true,
        },
        {
          nodeIndexOverall: 2,
          phosphateLabel: 'P',
          type: Entities.Phosphate,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });
});
