import {
  generateSequenceSelectionName,
  generateSequenceSelectionGroupNames,
} from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers/sequenceEdit';
import { Entities, LabeledNodesWithPositionInSequence } from 'ketcher-core';

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
      },
      {
        type: Entities.Nucleotide,
        sugarLabel: '25R',
        baseLabel: 'C',
        phosphateLabel: 'P',
        nodeIndexOverall: 1,
        hasR1Connection: true,
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
      },
      {
        type: Entities.Nucleotide,
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 1,
        hasR1Connection: true,
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
      },
      {
        type: Entities.Phosphate,
        phosphateLabel: 'P',
        nodeIndexOverall: 2,
        hasR1Connection: true,
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
      },
      {
        type: Entities.Nucleoside,
        sugarLabel: 'R',
        baseLabel: 'A',
        nodeIndexOverall: 2,
        isNucleosideConnectedAndSelectedWithPhosphate: false,
        hasR1Connection: true,
      },
    ];
    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: 'R',
      Bases: 'A',
      Phosphates: '[multiple]',
    });
  });
});
