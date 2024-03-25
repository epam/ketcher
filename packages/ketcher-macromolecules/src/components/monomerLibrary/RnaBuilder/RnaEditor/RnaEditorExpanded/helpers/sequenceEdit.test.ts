import {
  generateSequenceSelectionName,
  generateSequenceSelectionGroupNames,
} from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers/sequenceEdit';

describe('generateSequenceSelectionName', () => {
  it('returns the properly formatted string when a nucleotide is passed', () => {
    const labeledNucleotide = {
      sugarLabel: 'R',
      baseLabel: 'A',
      phosphateLabel: 'P',
      nodeIndexOverall: 0,
    };
    expect(generateSequenceSelectionName(labeledNucleotide)).toBe('R(A)P');
  });
});

describe('generateSequenceSelectionGroupNames', () => {
  it('returns undefined when no nucleotide passed', () => {
    expect(generateSequenceSelectionGroupNames()).toBeUndefined();
  });

  it('returns correct object for single nucleotide', () => {
    const labeledNucleotides = [
      {
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
      },
    ];
    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: 'R',
      Bases: 'A',
      Phosphates: 'P',
    });
  });

  it('returns correct object for multiple different nucleotides', () => {
    const labeledNucleotides = [
      {
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
      },
      {
        sugarLabel: '25R',
        baseLabel: 'C',
        phosphateLabel: 'P',
        nodeIndexOverall: 1,
      },
    ];
    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: '[multiple]',
      Bases: '[multiple]',
      Phosphates: 'P',
    });
  });

  it('returns correct object for multiple similar nucleotides', () => {
    const labeledNucleotides = [
      {
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
      },
      {
        sugarLabel: 'R',
        baseLabel: 'A',
        phosphateLabel: 'P',
        nodeIndexOverall: 1,
      },
    ];
    expect(generateSequenceSelectionGroupNames(labeledNucleotides)).toEqual({
      Sugars: 'R',
      Bases: 'A',
      Phosphates: 'P',
    });
  });
});
