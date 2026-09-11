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
import * as ketcherCore from 'ketcher-core';
import {
  Nucleotide,
  Nucleoside,
  Phosphate,
  RNABase,
  Sugar,
  MonomerSequenceNode,
  Entities,
  NodesSelection,
  STRAND_TYPE,
  PolymerBond,
  HydrogenBond,
  AttachmentPointName,
  KetMonomerClass,
} from 'ketcher-core';
import { generateSequenceContextMenuProps } from 'components/contextMenu/SequenceItemContextMenu/helpers';

const setSyncEditMode = (isSyncEditMode: boolean) => {
  jest.spyOn(ketcherCore, 'provideEditorInstance').mockReturnValue({
    mode: { isSyncEditMode },
  } as unknown as ketcherCore.CoreEditor);
};

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

// Create mock nodes with antisense property - sense nodes
const senseNodeNucleotide1 = cloneDeep(
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

const senseNodeNucleotide2 = cloneDeep(
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

// Create antisense nodes
const antisenseNodeNucleotide1 = cloneDeep(
  Object.assign(instanceOfNucleotide, {
    phosphate: Object.assign(instanceOfPhosphate, {
      monomerItem: {
        label: 'P',
      },
    }),
    rnaBase: Object.assign(instanceOfRNABase, {
      monomerItem: {
        label: 'T',
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

const antisenseNodeNucleotide2 = cloneDeep(
  Object.assign(instanceOfNucleotide, {
    phosphate: Object.assign(instanceOfPhosphate, {
      monomerItem: {
        label: 'P',
      },
    }),
    rnaBase: Object.assign(instanceOfRNABase, {
      monomerItem: {
        label: 'G',
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

// Mock selection where both sense and antisense nodes are selected
// This simulates the output after the fix in Editor.ts where both sense and antisense
// nodes are included as separate selections
const mockedSelectionsWithAntisense = [
  [
    {
      node: senseNodeNucleotide1,
      nodeIndexOverall: 0,
      hasR1Connection: false,
      twoStrandedNode: {
        senseNode: senseNodeNucleotide1,
        senseNodeIndex: 0,
        chain: {},
        antisenseNode: antisenseNodeNucleotide1,
        antisenseNodeIndex: 0,
        antisenseChain: {},
      },
    },
    {
      node: antisenseNodeNucleotide1,
      nodeIndexOverall: 0,
      hasR1Connection: false,
      twoStrandedNode: {
        senseNode: senseNodeNucleotide1,
        senseNodeIndex: 0,
        chain: {},
        antisenseNode: antisenseNodeNucleotide1,
        antisenseNodeIndex: 0,
        antisenseChain: {},
      },
    },
    {
      node: senseNodeNucleotide2,
      nodeIndexOverall: 1,
      hasR1Connection: true,
      twoStrandedNode: {
        senseNode: senseNodeNucleotide2,
        senseNodeIndex: 1,
        chain: {},
        antisenseNode: antisenseNodeNucleotide2,
        antisenseNodeIndex: 1,
        antisenseChain: {},
      },
    },
    {
      node: antisenseNodeNucleotide2,
      nodeIndexOverall: 1,
      hasR1Connection: true,
      twoStrandedNode: {
        senseNode: senseNodeNucleotide2,
        senseNodeIndex: 1,
        chain: {},
        antisenseNode: antisenseNodeNucleotide2,
        antisenseNodeIndex: 1,
        antisenseChain: {},
      },
    },
  ],
];

describe('SequenceItemContextMenu helpers', () => {
  beforeEach(() => {
    setSyncEditMode(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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
      hasAntisense: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Nucleotide,
          baseLabel: 'A',
          phosphateLabel: 'P',
          rnaBaseMonomerItem: {
            label: 'A',
          },
          sugarLabel: 'R',
          nodeIndexOverall: 0,
          hasR1Connection: false,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
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
      hasAntisense: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Nucleotide,
          baseLabel: 'C',
          phosphateLabel: 'P',
          rnaBaseMonomerItem: {
            label: 'C',
          },
          sugarLabel: 'R',
          nodeIndexOverall: 1,
          hasR1Connection: true,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
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
      hasAntisense: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Nucleoside,
          baseLabel: 'C',
          sugarLabel: 'R',
          nodeIndexOverall: 1,
          rnaBaseMonomerItem: {
            label: 'C',
          },
          isNucleosideConnectedAndSelectedWithPhosphate: undefined,
          hasR1Connection: true,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
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
      hasAntisense: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Nucleotide,
          baseLabel: 'A',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 0,
          rnaBaseMonomerItem: {
            label: 'A',
          },
          hasR1Connection: false,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
        },
        {
          type: Entities.Nucleotide,
          baseLabel: 'C',
          phosphateLabel: 'P',
          sugarLabel: 'R',
          nodeIndexOverall: 1,
          rnaBaseMonomerItem: {
            label: 'C',
          },
          hasR1Connection: true,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
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
      hasAntisense: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Nucleoside,
          baseLabel: 'C',
          sugarLabel: 'R',
          nodeIndexOverall: 1,
          rnaBaseMonomerItem: {
            label: 'C',
          },
          hasR1Connection: true,
          isNucleosideConnectedAndSelectedWithPhosphate: true,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
        },
        {
          type: Entities.Phosphate,
          phosphateLabel: 'P',
          nodeIndexOverall: 2,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
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
      hasAntisense: false,
      selectedSequenceLabeledNodes: [
        {
          type: Entities.Phosphate,
          phosphateLabel: 'P',
          nodeIndexOverall: 2,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
        },
        {
          type: Entities.Nucleoside,
          baseLabel: 'C',
          sugarLabel: 'R',
          nodeIndexOverall: 3,
          rnaBaseMonomerItem: {
            label: 'C',
          },
          hasR1Connection: true,
          isNucleosideConnectedAndSelectedWithPhosphate: false,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
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
      hasAntisense: false,
      selectedSequenceLabeledNodes: [
        {
          baseLabel: 'A',
          nodeIndexOverall: 0,
          phosphateLabel: 'P',
          rnaBaseMonomerItem: {
            label: 'A',
          },
          sugarLabel: 'R',
          type: Entities.Nucleotide,
          hasR1Connection: false,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
        },
        {
          baseLabel: 'C',
          nodeIndexOverall: 1,
          phosphateLabel: 'P',
          rnaBaseMonomerItem: {
            label: 'C',
          },
          sugarLabel: 'R',
          type: Entities.Nucleotide,
          hasR1Connection: true,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
        },
        {
          nodeIndexOverall: 2,
          phosphateLabel: 'P',
          type: Entities.Phosphate,
          hasAntisense: false,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return correct count for sense and antisense chain selection', () => {
    const result = generateSequenceContextMenuProps(
      mockedSelectionsWithAntisense as unknown as NodesSelection,
    );

    // When both sense and antisense are selected, we should get 4 nucleotides
    expect(result?.title).toBe('4 nucleotides');
    expect(result?.hasAntisense).toBe(true);
    expect(result?.selectedSequenceLabeledNodes).toHaveLength(4);
  });

  it('marks each labeled node with the strand it was selected from', () => {
    const result = generateSequenceContextMenuProps(
      mockedSelectionsWithAntisense as unknown as NodesSelection,
    );

    expect(
      result?.selectedSequenceLabeledNodes.map((node) => node.strandType),
    ).toEqual([
      STRAND_TYPE.SENSE,
      STRAND_TYPE.ANTISENSE,
      STRAND_TYPE.SENSE,
      STRAND_TYPE.ANTISENSE,
    ]);
  });

  describe('isInSelectedAntisensePair', () => {
    // Builds a real RNABase wired to a real Sugar through the R1/R3 pairing
    // (and, unless withBackbone is false, the sugar on to a real Phosphate
    // through R2/R1), so isBaseEligibleForDuplexSync can walk the actual
    // domain graph instead of a label-only fixture.
    const createConnectedBase = ({
      label,
      selected,
      withBackbone = true,
    }: {
      label: string;
      selected: boolean;
      withBackbone?: boolean;
    }) => {
      const base = Object.assign(Object.create(RNABase.prototype), {
        monomerItem: { label, props: { MonomerClass: KetMonomerClass.Base } },
        attachmentPointsToBonds: {},
        hydrogenBonds: [],
        selected,
      }) as RNABase;

      const sugar = Object.assign(Object.create(Sugar.prototype), {
        monomerItem: {
          label: 'R',
          props: { MonomerClass: KetMonomerClass.Sugar },
        },
        attachmentPointsToBonds: {},
        hydrogenBonds: [],
      }) as Sugar;

      const baseSugarBond = new PolymerBond(base, sugar);
      base.setBond(AttachmentPointName.R1, baseSugarBond);
      sugar.setBond(AttachmentPointName.R3, baseSugarBond);

      if (withBackbone) {
        const phosphate = Object.assign(Object.create(Phosphate.prototype), {
          monomerItem: {
            label: 'P',
            props: { MonomerClass: KetMonomerClass.Phosphate },
          },
          attachmentPointsToBonds: {},
          hydrogenBonds: [],
        }) as Phosphate;

        const backboneBond = new PolymerBond(sugar, phosphate);
        sugar.setBond(AttachmentPointName.R2, backboneBond);
        phosphate.setBond(AttachmentPointName.R1, backboneBond);
      }

      const nucleotide = Object.assign(Object.create(Nucleotide.prototype), {
        rnaBase: base,
        sugar,
      });

      return { base, nucleotide };
    };

    const linkHydrogenBond = (baseA: RNABase, baseB: RNABase) => {
      const hydrogenBond = new HydrogenBond(baseA, baseB);
      baseA.setBond(AttachmentPointName.HYDROGEN, hydrogenBond);
      baseB.setBond(AttachmentPointName.HYDROGEN, hydrogenBond);
    };

    const selectionFor = (nucleotide: Nucleotide) => [
      [{ node: nucleotide, nodeIndexOverall: 0, hasR1Connection: false }],
    ];

    it('is true when both hydrogen-bonded, eligible bases are selected and sync editing is on', () => {
      setSyncEditMode(true);
      const sense = createConnectedBase({ label: 'A', selected: true });
      const antisense = createConnectedBase({ label: 'T', selected: true });
      linkHydrogenBond(sense.base, antisense.base);

      const result = generateSequenceContextMenuProps(
        selectionFor(sense.nucleotide) as unknown as NodesSelection,
      );

      expect(
        result?.selectedSequenceLabeledNodes[0].isInSelectedAntisensePair,
      ).toBe(true);
    });

    it('is false when only the sense side of the pair is selected', () => {
      setSyncEditMode(true);
      const sense = createConnectedBase({ label: 'A', selected: true });
      const antisense = createConnectedBase({ label: 'T', selected: false });
      linkHydrogenBond(sense.base, antisense.base);

      const result = generateSequenceContextMenuProps(
        selectionFor(sense.nucleotide) as unknown as NodesSelection,
      );

      expect(
        result?.selectedSequenceLabeledNodes[0].isInSelectedAntisensePair,
      ).toBe(false);
    });

    it('is false when both bases are selected but are not hydrogen bonded to each other', () => {
      setSyncEditMode(true);
      const sense = createConnectedBase({ label: 'A', selected: true });
      // Deliberately not linked with linkHydrogenBond.
      createConnectedBase({ label: 'T', selected: true });

      const result = generateSequenceContextMenuProps(
        selectionFor(sense.nucleotide) as unknown as NodesSelection,
      );

      expect(
        result?.selectedSequenceLabeledNodes[0].isInSelectedAntisensePair,
      ).toBe(false);
    });

    it('is false when the partner base is hydrogen bonded but its sugar has no backbone connection', () => {
      setSyncEditMode(true);
      const sense = createConnectedBase({ label: 'A', selected: true });
      const antisense = createConnectedBase({
        label: 'T',
        selected: true,
        withBackbone: false,
      });
      linkHydrogenBond(sense.base, antisense.base);

      const result = generateSequenceContextMenuProps(
        selectionFor(sense.nucleotide) as unknown as NodesSelection,
      );

      expect(
        result?.selectedSequenceLabeledNodes[0].isInSelectedAntisensePair,
      ).toBe(false);
    });

    it('is false when both strands are selected but sync editing is off', () => {
      setSyncEditMode(false);
      const sense = createConnectedBase({ label: 'A', selected: true });
      const antisense = createConnectedBase({ label: 'T', selected: true });
      linkHydrogenBond(sense.base, antisense.base);

      const result = generateSequenceContextMenuProps(
        selectionFor(sense.nucleotide) as unknown as NodesSelection,
      );

      expect(
        result?.selectedSequenceLabeledNodes[0].isInSelectedAntisensePair,
      ).toBe(false);
    });
  });
});
