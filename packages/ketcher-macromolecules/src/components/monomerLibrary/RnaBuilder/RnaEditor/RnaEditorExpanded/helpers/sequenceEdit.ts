import {
  Entities,
  LabeledNodesWithPositionInSequence,
  MonomerOrAmbiguousType,
} from 'ketcher-core';

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

export const applyMonomerToSequenceSelection = (
  sequenceSelection: LabeledNodesWithPositionInSequence[],
  field: string,
  groupItem: MonomerOrAmbiguousType,
  isBaseGroup: boolean,
) =>
  sequenceSelection.map((node) => {
    // Do not set 'phosphateLabel' for Nucleoside if it is connected and selected with Phosphate
    // Do not set 'sugarLabel', 'baseLabel' for Phosphate
    if (
      (node.isNucleosideConnectedAndSelectedWithPhosphate &&
        field === 'phosphateLabel') ||
      (node.type === Entities.Phosphate &&
        (field === 'sugarLabel' || field === 'baseLabel'))
    ) {
      return node;
    }

    return {
      ...node,
      [field]: groupItem.label,
      rnaBaseMonomerItem: isBaseGroup ? groupItem : node.rnaBaseMonomerItem,
    };
  });
