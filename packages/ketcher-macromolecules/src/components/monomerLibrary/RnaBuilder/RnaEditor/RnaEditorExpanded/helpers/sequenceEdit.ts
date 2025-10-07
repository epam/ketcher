import { Entities, LabeledNodesWithPositionInSequence } from 'ketcher-core';

const getNucleotideMonomerGroupName = (nameSet: Set<string>): string => {
  if (nameSet.size === 0) return '';
  return nameSet.size === 1 ? [...nameSet][0] : '[multiple]';
};

export const generateSequenceSelectionGroupNames = (
  labeledNucleotides?: LabeledNodesWithPositionInSequence[],
) => {
  if (!labeledNucleotides?.length) return;

  const namesSets = {
    sugarLabel: new Set<string>(),
    baseLabel: new Set<string>(),
    phosphateLabel: new Set<string>(),
  };

  for (const labeledNucleotide of labeledNucleotides) {
    for (const item of ['sugarLabel', 'baseLabel', 'phosphateLabel']) {
      if (
        labeledNucleotide?.[item] ||
        (!labeledNucleotide?.[item] &&
          labeledNucleotide.type === Entities.Nucleoside &&
          !labeledNucleotide.isNucleosideConnectedAndSelectedWithPhosphate)
      )
        namesSets[item].add(labeledNucleotide?.[item]);
    }
  }

  return {
    Sugars: getNucleotideMonomerGroupName(namesSets.sugarLabel),
    Bases: getNucleotideMonomerGroupName(namesSets.baseLabel),
    Phosphates: getNucleotideMonomerGroupName(namesSets.phosphateLabel),
  };
};

export const generateSequenceSelectionName = (
  labeledNucleoelements: LabeledNodesWithPositionInSequence[],
) => {
  const groupNames = generateSequenceSelectionGroupNames(labeledNucleoelements);

  return `${groupNames?.Sugars}(${groupNames?.Bases})${
    groupNames?.Phosphates ?? ''
  }`;
};
