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

const validBases: string[] = [
  'A',
  'T',
  'U',
  'C',
  'G',
  'N',
  'B',
  'D',
  'H',
  'K',
  'W',
  'Y',
  'M',
  'R',
  'S',
  'V',
];

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
      twoStrandedNode,
    } = selection;
    const hasAntisense = Boolean(twoStrandedNode?.antisenseNode);

    if (node instanceof Nucleotide) {
      labeledNodes.push({
        type: Entities.Nucleotide,
        baseLabel: node?.rnaBase?.label,
        sugarLabel: node?.sugar?.label,
        phosphateLabel: node?.phosphate?.label,
        hasR1Connection,
        nodeIndexOverall,
        hasAntisense,
      });
    } else if (node instanceof Nucleoside) {
      labeledNodes.push({
        type: Entities.Nucleoside,
        baseLabel: node?.rnaBase?.label,
        sugarLabel: node?.sugar?.label,
        isNucleosideConnectedAndSelectedWithPhosphate,
        hasR1Connection,
        nodeIndexOverall,
        hasAntisense,
      });
    } else if (node?.monomer instanceof Phosphate) {
      labeledNodes.push({
        type: Entities.Phosphate,
        phosphateLabel: node?.monomer?.label,
        nodeIndexOverall,
        hasAntisense,
      });
    }
  }

  return labeledNodes;
};

function isNucleotideNucleosideOrPhosphate(selection: NodeSelection): boolean {
  const { node } = selection;
  return (
    node instanceof Nucleotide ||
    node instanceof Nucleoside ||
    node?.monomer instanceof Phosphate
  );
}

// Check if the selection forms a valid backbone chain.
// A valid backbone consists of nucleotides with `hasR1Connection: true`,
// meaning they are connected via R1-R2.
const isValidBackboneChain = (selection: NodeSelection[]) => {
  if (selection.length < 2) return false; // Backbone must have at least two elements

  return selection.every((node) => node.hasR1Connection);
};

// Check if at least one sugar is connected to a base via R3-R1.
// This ensures the selection contains a valid sense base connection.
const hasSugarBaseConnection = (
  selection: LabeledNodesWithPositionInSequence[],
) => {
  return selection.some((node) => node.sugarLabel && node.baseLabel);
};

// Check if all selected bases can form valid complementary pairs.
const isValidBaseSelection = (
  selection: LabeledNodesWithPositionInSequence[],
) => {
  return !selection.some(
    (node) => node.baseLabel && !validBases.includes(node.baseLabel),
  );
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
  let hasAntisense = false;
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

    if (node.hasAntisense) {
      hasAntisense = true;
    }
  }
  if (countOfSelections > countOfNucleoelements) {
    if (!selectionsFlatten.every(isNucleotideNucleosideOrPhosphate)) {
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
    title = isSelectedOnlyNucleoelements
      ? `${countOfNucleoelements} nucleotides`
      : `${countOfSelections} elements`;
  }

  return {
    title,
    selectedSequenceLabeledNodes,
    isSelectedOnlyNucleoelements,
    isSelectedAtLeastOneNucleoelement,
    isSequenceFirstsOnlyNucleoelementsSelected,
    hasAntisense,
    isValidBackboneChain: isValidBackboneChain(selectionsFlatten),
    hasSugarBaseConnection: hasSugarBaseConnection(
      selectedSequenceLabeledNodes,
    ),
    isValidBaseSelection: isValidBaseSelection(selectedSequenceLabeledNodes),
  };
};
