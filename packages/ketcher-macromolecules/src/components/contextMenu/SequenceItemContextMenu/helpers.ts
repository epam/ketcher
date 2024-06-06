import { flatten, get, merge } from 'lodash';
import {
  Nucleotide,
  Nucleoside,
  LabeledNodesWithPositionInSequence,
  NodeSelection,
  NodesSelection,
  Phosphate,
  Entities,
} from 'ketcher-core';
import { getCountOfNucleoelements } from 'helpers/countNucleoelents';

const generateLabeledNodes = (
  selectionsFlatten: NodeSelection[],
): LabeledNodesWithPositionInSequence[] => {
  const labeledNodes: LabeledNodesWithPositionInSequence[] = [];

  for (const selection of selectionsFlatten) {
    const {
      node,
      nodeIndexOverall,
      isNucleosideConnectedAndSelectedWithPhosphate,
      hasR1Connection,
    } = selection;

    if (node instanceof Nucleotide) {
      labeledNodes.push({
        type: Entities.Nucleotide,
        baseLabel: node?.rnaBase?.label,
        sugarLabel: node?.sugar?.label,
        phosphateLabel: node?.phosphate?.label,
        hasR1Connection,
        nodeIndexOverall,
      });
    } else if (node instanceof Nucleoside) {
      labeledNodes.push({
        type: Entities.Nucleoside,
        baseLabel: node?.rnaBase?.label,
        sugarLabel: node?.sugar?.label,
        isNucleosideConnectedAndSelectedWithPhosphate,
        hasR1Connection,
        nodeIndexOverall,
      });
    } else if (node?.monomer instanceof Phosphate) {
      labeledNodes.push({
        type: Entities.Phosphate,
        phosphateLabel: node?.monomer?.label,
        nodeIndexOverall,
      });
    }
  }

  return labeledNodes;
};

// Generate menu title if selected:
// one nucleotide
// one nucleoside
// nucleoside + phosphate
const generateNucleoelementTitle = (
  elements: LabeledNodesWithPositionInSequence[],
) => {
  let tempTitle = '';
  const element = elements.length === 1 ? elements[0] : merge({}, ...elements);

  for (const property of ['sugarLabel', 'baseLabel', 'phosphateLabel']) {
    const label = get(element, property, '');

    if (property === 'baseLabel') {
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
  const countOfSelections = selectionsFlatten.length;
  const countOfNucleoelements = getCountOfNucleoelements(selectionsFlatten);
  let title: string;
  let isSelectedAtLeastOneNucleoelement = false;
  let isSelectedOnlyNucleoelements = true;
  let isSequenceFirstsOnlyNucleoelementsSelected = true;

  // Generate labeled elements for RNA Builder
  const selectedSequenceLabeledNodes = generateLabeledNodes(selectionsFlatten);

  for (let i = 0; i < selectedSequenceLabeledNodes.length; i++) {
    const node = selectedSequenceLabeledNodes[i];
    const prevNode = selectedSequenceLabeledNodes[i - 1];
    const isNodeNucleotideOrNucleoside =
      node.type === Entities.Nucleotide || node.type === Entities.Nucleoside;
    const isNucleotideConnection =
      prevNode?.isNucleosideConnectedAndSelectedWithPhosphate;

    if (isNodeNucleotideOrNucleoside) {
      isSelectedAtLeastOneNucleoelement = true;
    }

    if (isNodeNucleotideOrNucleoside || isNucleotideConnection) {
      if (node.hasR1Connection)
        isSequenceFirstsOnlyNucleoelementsSelected = false;
    } else {
      isSequenceFirstsOnlyNucleoelementsSelected = false;
      isSelectedOnlyNucleoelements = false;
    }
  }

  // Set title based on selected elements
  if (
    countOfSelections === 1 ||
    (countOfNucleoelements === 1 && isSelectedOnlyNucleoelements)
  ) {
    title = generateNucleoelementTitle(selectedSequenceLabeledNodes);
  } else {
    title =
      countOfSelections === countOfNucleoelements
        ? `${countOfNucleoelements} nucleotides`
        : `${countOfSelections} elements`;
  }

  return {
    title,
    selectedSequenceLabeledNodes,
    isSelectedOnlyNucleoelements,
    isSelectedAtLeastOneNucleoelement,
    isSequenceFirstsOnlyNucleoelementsSelected,
  };
};
