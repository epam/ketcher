import { LabeledNucleotideWithPositionInSequence } from 'ketcher-core';

const getNucleotideMonomerGroupName = (nameSet: Set<string>): string => {
  return nameSet.size === 1 ? [...nameSet][0] : '[multiple]';
};

export const generateSequenceSelectionGroupNames = (
  labeledNucleotides?: LabeledNucleotideWithPositionInSequence[],
) => {
  if (!labeledNucleotides?.length) return;

  const namesSets = {
    sugarLabel: new Set<string>(),
    baseLabel: new Set<string>(),
    phosphateLabel: new Set<string>(),
  };

  for (let i = 0; i < labeledNucleotides.length; i++) {
    for (const item of ['sugarLabel', 'baseLabel', 'phosphateLabel'])
      namesSets[item].add(labeledNucleotides[i]?.[item]);
  }

  return {
    Sugars: getNucleotideMonomerGroupName(namesSets.sugarLabel),
    Bases: getNucleotideMonomerGroupName(namesSets.baseLabel),
    Phosphates: getNucleotideMonomerGroupName(namesSets.phosphateLabel),
  };
};

export const generateSequenceSelectionName = (
  labeledNucleotide: LabeledNucleotideWithPositionInSequence,
) => {
  return `${labeledNucleotide?.sugarLabel}(${labeledNucleotide.baseLabel})${labeledNucleotide?.phosphateLabel}`;
};
