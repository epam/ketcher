import { Entities, LabeledNodesWithPositionInSequence } from 'ketcher-core';

export const MULTIPLE_MONOMERS_LABEL = '[multiple]';
export const DISABLED_MONOMERS_LABEL = '[disabled]';

const getNucleotideMonomerGroupName = (
  nameSet: Set<string>,
  isBaseModificationBlocked = false,
): string => {
  if (nameSet.size === 0) return '';
  if (nameSet.size === 1) return [...nameSet][0];

  return isBaseModificationBlocked
    ? DISABLED_MONOMERS_LABEL
    : MULTIPLE_MONOMERS_LABEL;
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

  const isBaseModificationBlocked = labeledNucleotides.some(
    (labeledNucleotide) => labeledNucleotide.isInSelectedAntisensePair,
  );

  return {
    Sugars: getNucleotideMonomerGroupName(namesSets.sugarLabel),
    Bases: getNucleotideMonomerGroupName(
      namesSets.baseLabel,
      isBaseModificationBlocked,
    ),
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
