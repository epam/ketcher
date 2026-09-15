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
import i18next from 'i18next';
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
  SequenceRenderer,
  TargetedStrand,
} from 'ketcher-core';
import { generateSequenceContextMenuProps } from 'components/contextMenu/SequenceItemContextMenu/helpers';
import macromoleculesDialogs from '../../../locales/en/macromoleculesDialogs.json';

// Plain i18next interpolation configured with the same {var} delimiters as
// the real app's i18next-icu plugin (not the plugin itself - its
// intl-messageformat dependency ships ESM this package's Jest config can't
// transform inside node_modules). Plain variable substitution is all these
// keys need.
const i18nTestInstance = i18next.createInstance();
i18nTestInstance.init({
  lng: 'en',
  resources: { en: { macromoleculesDialogs } },
  interpolation: { escapeValue: false, prefix: '{', suffix: '}' },
});
const t = i18nTestInstance.getFixedT('en', 'macromoleculesDialogs');

const setSyncEditMode = (isSyncEditMode: boolean) => {
  jest.spyOn(ketcherCore, 'provideEditorInstance').mockReturnValue({
    mode: { isSyncEditMode },
  } as unknown as ketcherCore.CoreEditor);
};

// Mocks the strand a selection gesture targeted, exactly as
// SequenceRenderer.targetedStrand would resolve it (either from an explicit
// gesture record or derived from selection state) - helpers.ts only ever
// reads the getter, so mocking it directly is sufficient here.
const setTargetedStrand = (targetedStrand: TargetedStrand) => {
  jest
    .spyOn(SequenceRenderer, 'targetedStrand', 'get')
    .mockReturnValue(targetedStrand);
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
    // Default to 'both' so the pre-existing single-strand fixtures (which
    // carry no twoStrandedNode) keep passing through the filter unchanged.
    // Tests that care about the filter set their own targeted strand.
    setTargetedStrand('both');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return undefined if no entry data', () => {
    const result = generateSequenceContextMenuProps(undefined, t);
    expect(result).toBeUndefined();
  });

  it('should return correct data for first in chain selected Nucleotide', () => {
    const result = generateSequenceContextMenuProps(
      mockedSelectionsFirstNucleotide,
      t,
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
          rnaBaseMonomerItem: {
            label: 'A',
          },
          sugarLabel: 'R',
          nodeIndexOverall: 0,
          hasR1Connection: false,
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
      t,
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
          rnaBaseMonomerItem: {
            label: 'C',
          },
          sugarLabel: 'R',
          nodeIndexOverall: 1,
          hasR1Connection: true,
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
      t,
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
          rnaBaseMonomerItem: {
            label: 'C',
          },
          isNucleosideConnectedAndSelectedWithPhosphate: undefined,
          hasR1Connection: true,
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
      t,
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
          rnaBaseMonomerItem: {
            label: 'A',
          },
          hasR1Connection: false,
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
      t,
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
          rnaBaseMonomerItem: {
            label: 'C',
          },
          hasR1Connection: true,
          isNucleosideConnectedAndSelectedWithPhosphate: true,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
        },
        {
          type: Entities.Phosphate,
          phosphateLabel: 'P',
          nodeIndexOverall: 2,
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
      t,
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
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return correct data for three selected elements', () => {
    const result = generateSequenceContextMenuProps(
      mockedSelections3Elements,
      t,
    );
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
          rnaBaseMonomerItem: {
            label: 'A',
          },
          sugarLabel: 'R',
          type: Entities.Nucleotide,
          hasR1Connection: false,
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
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
        },
        {
          nodeIndexOverall: 2,
          phosphateLabel: 'P',
          type: Entities.Phosphate,
          strandType: STRAND_TYPE.SENSE,
          isInSelectedAntisensePair: false,
        },
      ],
    };

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return correct count for sense and antisense chain selection when both strands are targeted', () => {
    setTargetedStrand('both');
    const result = generateSequenceContextMenuProps(
      mockedSelectionsWithAntisense as unknown as NodesSelection,
      t,
    );

    // When both sense and antisense are targeted, both entries per column
    // survive the filter, so we get 4 nucleotides for 2 duplex positions.
    expect(result?.title).toBe('4 nucleotides');
    expect(result?.selectedSequenceLabeledNodes).toHaveLength(4);
  });

  it('marks each labeled node with the strand it was selected from', () => {
    setTargetedStrand('both');
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

  describe('one entry per duplex position', () => {
    // mockedSelectionsWithAntisense carries the editor's right-click output
    // for a 2-position duplex column selection: one NodeSelection per strand
    // per position (4 entries total for 2 positions).
    it('keeps only the sense entry per column when the record is SENSE', () => {
      setTargetedStrand(STRAND_TYPE.SENSE);

      const result = generateSequenceContextMenuProps(
        mockedSelectionsWithAntisense as unknown as NodesSelection,
      );

      expect(result?.title).toBe('2 nucleotides');
      expect(result?.selectedSequenceLabeledNodes).toHaveLength(2);
      expect(
        result?.selectedSequenceLabeledNodes.map((node) => node.strandType),
      ).toEqual([STRAND_TYPE.SENSE, STRAND_TYPE.SENSE]);
    });

    it('keeps only the antisense entry per column when the record is ANTISENSE', () => {
      setTargetedStrand(STRAND_TYPE.ANTISENSE);

      const result = generateSequenceContextMenuProps(
        mockedSelectionsWithAntisense as unknown as NodesSelection,
      );

      expect(result?.title).toBe('2 nucleotides');
      expect(result?.selectedSequenceLabeledNodes).toHaveLength(2);
      expect(
        result?.selectedSequenceLabeledNodes.map((node) => node.strandType),
      ).toEqual([STRAND_TYPE.ANTISENSE, STRAND_TYPE.ANTISENSE]);
    });

    it('keeps both entries per column when the record is derived as "both" (no explicit gesture record)', () => {
      // Simulates the case where no gesture wrote a record and
      // SequenceRenderer.targetedStrand derived 'both' from selection state
      // (e.g. a selection rectangle spanning both strands).
      setTargetedStrand('both');

      const result = generateSequenceContextMenuProps(
        mockedSelectionsWithAntisense as unknown as NodesSelection,
      );

      expect(result?.title).toBe('4 nucleotides');
      expect(result?.selectedSequenceLabeledNodes).toHaveLength(4);
      expect(
        result?.selectedSequenceLabeledNodes.map((node) => node.strandType),
      ).toEqual([
        STRAND_TYPE.SENSE,
        STRAND_TYPE.ANTISENSE,
        STRAND_TYPE.SENSE,
        STRAND_TYPE.ANTISENSE,
      ]);
    });

    it('keeps every entry of a single-strand (no-partner) selection when the record is SENSE', () => {
      setTargetedStrand(STRAND_TYPE.SENSE);

      const result = generateSequenceContextMenuProps(
        mockedSelections2Nucleotides,
      );

      // mockedSelections2Nucleotides carries no twoStrandedNode: both
      // entries classify as SENSE and both must survive.
      expect(result?.selectedSequenceLabeledNodes).toHaveLength(2);
    });
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

    it('is true when both hydrogen-bonded, eligible bases are selected, sync editing is on, and the record is "both"', () => {
      setSyncEditMode(true);
      setTargetedStrand('both');
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

    // Task 6: on a duplex, selection is column-based, so both bases of a
    // pair are selected even when the gesture targeted only one strand.
    // `isInSelectedAntisensePair` must be false whenever the record is not
    // 'both', regardless of that selection state -- this is the same
    // selection (both bases selected, hydrogen bonded, eligible) as the
    // "is true" case above, with only the record changed.
    //
    // Only the SENSE record is exercised here, not ANTISENSE: `selectionFor`
    // builds a bare NodeSelection with no `twoStrandedNode`, so
    // `filterSelectionsToTargetedStrand` (helpers.ts) classifies it as SENSE
    // by default and would filter it out entirely for an ANTISENSE record,
    // leaving `selectedSequenceLabeledNodes` empty rather than exercising
    // `isInSelectedAntisensePair` at all.
    it('is false when the record is SENSE, even though both hydrogen-bonded, eligible bases are selected and sync editing is on', () => {
      setSyncEditMode(true);
      setTargetedStrand(STRAND_TYPE.SENSE);
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

    it('is false when only the sense side of the pair is selected', () => {
      setSyncEditMode(true);
      setTargetedStrand('both');
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
      setTargetedStrand('both');
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
      setTargetedStrand('both');
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
      setTargetedStrand('both');
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
