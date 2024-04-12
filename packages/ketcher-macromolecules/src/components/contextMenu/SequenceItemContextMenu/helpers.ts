import { flatten, get } from 'lodash';
import {
  Nucleotide,
  LabeledNucleotideWithPositionInSequence,
  NodeSelection,
  NodesSelection,
} from 'ketcher-core';

const generateLabeledNucleotides = (
  selectionsFlatten: NodeSelection[],
): LabeledNucleotideWithPositionInSequence[] => {
  const labeledNucleotides: LabeledNucleotideWithPositionInSequence[] = [];

  for (const selection of selectionsFlatten) {
    const node = selection.node;
    if (!(node instanceof Nucleotide)) {
      continue;
    }

    const { nodeIndexOverall } = selection;
    labeledNucleotides.push({
      baseLabel: node.rnaBase.label,
      sugarLabel: node.sugar.label,
      phosphateLabel: node.phosphate.label,
      nodeIndexOverall,
    });
  }

  return labeledNucleotides;
};

// Generate menu title if selected one nucleotide
const generateNucleotideTitle = (nucleotide: Nucleotide) => {
  let tempTitle = '';

  for (const property of ['sugar', 'rnaBase', 'phosphate']) {
    const propertyVal = nucleotide[property];
    const label = get(propertyVal, 'monomerItem.label', '');

    if (property === 'rnaBase') {
      tempTitle += `(${label})`;
    } else {
      tempTitle += label;
    }
  }

  return tempTitle;
};

export const generateSequenceContextMenuProps = (
  selections?: NodesSelection,
) => {
  if (!selections?.length) return;

  const selectionsFlatten: NodeSelection[] = flatten(selections);
  let title: string;
  let isSelectedAtLeastOneNucleotide = false;
  let isSelectedOnlyNucleotides = true;
  const selectionsCount = selectionsFlatten.length;
  let isSequenceFirstsOnlyNucleotidesSelected = true;

  for (let i = 0; i < selectionsCount; i++) {
    const node = selectionsFlatten[i].node;
    if (node instanceof Nucleotide) {
      const nodeAttachmentR1 = node.sugar.attachmentPointsToBonds.R1;
      if (nodeAttachmentR1 !== null) {
        isSequenceFirstsOnlyNucleotidesSelected = false;
      }
      isSelectedAtLeastOneNucleotide = true;
    } else {
      isSequenceFirstsOnlyNucleotidesSelected = false;
      isSelectedOnlyNucleotides = false;
    }
  }

  // Set title based on selected elements
  if (
    selectionsCount === 1 &&
    selectionsFlatten[0].node instanceof Nucleotide
  ) {
    title = generateNucleotideTitle(selectionsFlatten[0].node);
  } else {
    const titleElementType = isSelectedOnlyNucleotides
      ? 'nucleotides'
      : 'elements';
    title = `${selectionsCount} ${titleElementType}`;
  }

  // Generate labeled elements for RNA Builder
  const selectedSequenceLabeledNucleotides =
    generateLabeledNucleotides(selectionsFlatten);

  return {
    title,
    isSelectedOnlyNucleotides,
    isSelectedAtLeastOneNucleotide,
    selectedSequenceLabeledNucleotides,
    isSequenceFirstsOnlyNucleotidesSelected,
  };
};
