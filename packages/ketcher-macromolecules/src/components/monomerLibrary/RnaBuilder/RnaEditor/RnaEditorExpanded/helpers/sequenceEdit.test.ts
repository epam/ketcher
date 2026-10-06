import {
  generateSequenceSelectionName,
  generateSequenceSelectionGroupNames,
} from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers/sequenceEdit';
import {
  Entities,
  LabeledNodesWithPositionInSequence,
  STRAND_TYPE,
} from 'ketcher-core';

describe('generateSequenceSelectionName', () => {
  it('returns the properly formatted string when a nucleotide is passed', () => {
    const labeledNucleotides: LabeledNodesWithPositionInSequence[] = [
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
        hasR1Connection: false,
        strandType: STRAND_TYPE.SENSE,
      },
    ];
    expect(generateSequenceSelectionName(labeledNucleotides)).toBe('R(A)P');
  });
});

describe('generateSequenceSelectionGroupNames', () => {
  it('returns undefined when no nucleotide passed', () => {
    expect(generateSequenceSelectionGroupNames()).toBeUndefined();
  });

  it('returns correct object for single nucleotide', () => {
    const labeledNucleotides: LabeledNodesWithPositionInSequence[] = [
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
        hasR1Connection: false,
        strandType: STRAND_TYPE.SENSE,
      },
    ];
    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: 'R',
      Bases: 'A',
      Phosphates: 'P',
    });
  });

  it('returns correct object for multiple different nucleotides', () => {
    const labeledNucleotides: LabeledNodesWithPositionInSequence[] = [
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
        hasR1Connection: false,
        strandType: STRAND_TYPE.SENSE,
      },
      {
        type: Entities.Nucleotide,
        sugarLabel: '25R',
        baseLabel: 'C',
        phosphateLabel: 'P',
        nodeIndexOverall: 1,
        hasR1Connection: true,
        strandType: STRAND_TYPE.SENSE,
      },
    ];
    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: '[multiple]',
      Bases: '[multiple]',
      Phosphates: 'P',
    });
  });

  it('returns correct object for multiple similar nucleotides', () => {
    const labeledNucleotides: LabeledNodesWithPositionInSequence[] = [
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
        hasR1Connection: false,
        strandType: STRAND_TYPE.SENSE,
      },
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 1,
        hasR1Connection: true,
        strandType: STRAND_TYPE.SENSE,
      },
    ];
    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: 'R',
      Bases: 'A',
      Phosphates: 'P',
    });
  });

  it('returns correct object for nucleoside + phosphate (as it is nucleotide)', () => {
    const labeledNucleotides: LabeledNodesWithPositionInSequence[] = [
      {
        type: Entities.Nucleoside,
        sugarLabel: 'R',
        baseLabel: 'A',
        nodeIndexOverall: 1,
        isNucleosideConnectedAndSelectedWithPhosphate: true,
        hasR1Connection: true,
        strandType: STRAND_TYPE.SENSE,
      },
      {
        type: Entities.Phosphate,
        phosphateLabel: 'P',
        nodeIndexOverall: 2,
        hasR1Connection: true,
        strandType: STRAND_TYPE.SENSE,
      },
    ];
    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: 'R',
      Bases: 'A',
      Phosphates: 'P',
    });
  });

  it('returns correct object for phosphate + nucleoside (as it is not nucleotide)', () => {
    const labeledNucleotides: LabeledNodesWithPositionInSequence[] = [
      {
        type: Entities.Phosphate,
        phosphateLabel: 'P',
        nodeIndexOverall: 1,
        hasR1Connection: true,
        strandType: STRAND_TYPE.SENSE,
      },
      {
        type: Entities.Nucleoside,
        sugarLabel: 'R',
        baseLabel: 'A',
        nodeIndexOverall: 2,
        isNucleosideConnectedAndSelectedWithPhosphate: false,
        hasR1Connection: true,
        strandType: STRAND_TYPE.SENSE,
      },
    ];
    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: 'R',
      Bases: 'A',
      Phosphates: '[multiple]',
    });
  });

  it('returns [disabled] for differing bases when a selected antisense pair is present', () => {
    const labeledNucleotides: LabeledNodesWithPositionInSequence[] = [
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
        hasR1Connection: false,
        strandType: STRAND_TYPE.SENSE,
        isInSelectedAntisensePair: true,
      },
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'C',
        phosphateLabel: 'P',
        nodeIndexOverall: 1,
        hasR1Connection: false,
        strandType: STRAND_TYPE.SENSE,
        isInSelectedAntisensePair: true,
      },
    ];

    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: 'R',
      Bases: '[disabled]',
      Phosphates: 'P',
    });
  });

  it('keeps the single base symbol when a selected antisense pair is present', () => {
    const labeledNucleotides: LabeledNodesWithPositionInSequence[] = [
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
        hasR1Connection: false,
        strandType: STRAND_TYPE.SENSE,
        isInSelectedAntisensePair: true,
      },
    ];

    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: 'R',
      Bases: 'A',
      Phosphates: 'P',
    });
  });

  it('still returns [multiple] when no selected antisense pair is present', () => {
    const labeledNucleotides: LabeledNodesWithPositionInSequence[] = [
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
        hasR1Connection: false,
        strandType: STRAND_TYPE.SENSE,
        isInSelectedAntisensePair: false,
      },
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'C',
        phosphateLabel: 'P',
        nodeIndexOverall: 1,
        hasR1Connection: false,
        strandType: STRAND_TYPE.SENSE,
        isInSelectedAntisensePair: false,
      },
    ];

    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: 'R',
      Bases: '[multiple]',
      Phosphates: 'P',
    });
  });
});
