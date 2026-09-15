import { flatten, get, merge } from 'lodash';
import type { TFunction } from 'i18next';
import {
  Nucleotide,
  Nucleoside,
  LabeledNodesWithPositionInSequence,
  NodeSelection,
  NodesSelection,
  Phosphate,
  Entities,
  SequenceNode,
  isTwoStrandedNodeRestrictedForHydrogenBondCreation,
  AmbiguousMonomer,
  STRAND_TYPE,
  isSelectedAntisensePair,
  provideEditorInstance,
  SequenceRenderer,
} from 'ketcher-core';
import { getCountOfNucleoelements } from 'helpers/countNucleoelents';

// The editor's right-click handler emits one NodeSelection per selected
// strand, so a duplex column arrives here twice (once per strand). Keep
// only the entry belonging to the strand the selection gesture targeted:
// - SENSE / ANTISENSE record: keep only that strand's entry per column.
// - 'both' record: keep every entry. A genuine both-strands gesture needs
//   both entries because the RNA Builder write-back
//   (SequenceMode.modifySequenceInRnaBuilder) honours each payload entry's
//   own strandType, and the both-strands block (keyed on
//   isInSelectedAntisensePair) needs to still see a pair. A selection
//   rectangle over a ragged duplex also derives 'both', but there no column
//   is double-selected, so every entry survives unfiltered.
// A single-partner column (an overhang, a plain single strand) has no
// twoStrandedNode partner on the other side, so it is never mistakenly
// dropped: it is only excluded if its own strand differs from the record,
// which should not happen for a well-formed selection.
const filterSelectionsToTargetedStrand = (
  selectionsFlatten: NodeSelection[],
): NodeSelection[] => {
  const targetedStrand = SequenceRenderer.targetedStrand;

  if (targetedStrand === 'both') {
    return selectionsFlatten;
  }

  return selectionsFlatten.filter(({ node, twoStrandedNode }) => {
    const strandType =
      twoStrandedNode?.antisenseNode === node
        ? STRAND_TYPE.ANTISENSE
        : STRAND_TYPE.SENSE;

    return strandType === targetedStrand;
  });
};

const generateLabeledNodes = (
  selectionsFlatten: NodeSelection[],
): LabeledNodesWithPositionInSequence[] => {
  const labeledNodes: LabeledNodesWithPositionInSequence[] = [];
  const isSyncEditMode = Boolean(provideEditorInstance().mode.isSyncEditMode);
  // Recorded once for the whole selection: the same value must apply to
  // every node in this batch, not be re-derived per position.
  const bothStrandsTargeted = SequenceRenderer.targetedStrand === 'both';

  for (const selection of selectionsFlatten) {
    const {
      node,
      nodeIndexOverall,
      isNucleosideConnectedAndSelectedWithPhosphate,
      hasR1Connection,
      twoStrandedNode,
    } = selection;
    const strandType =
      twoStrandedNode?.antisenseNode === node
        ? STRAND_TYPE.ANTISENSE
        : STRAND_TYPE.SENSE;
    const isInSelectedAntisensePair =
      isSyncEditMode &&
      isSelectedAntisensePair(
        node instanceof Nucleotide || node instanceof Nucleoside
          ? node.rnaBase
          : node?.monomer,
        bothStrandsTargeted,
      );

    if (node instanceof Nucleotide) {
      labeledNodes.push({
        type: Entities.Nucleotide,
        baseLabel: node?.rnaBase?.label,
        sugarLabel: node?.sugar?.label,
        phosphateLabel: node?.phosphate?.label,
        rnaBaseMonomerItem:
          node.rnaBase instanceof AmbiguousMonomer
            ? node.rnaBase.variantMonomerItem
            : node.rnaBase.monomerItem,
        hasR1Connection,
        nodeIndexOverall,
        strandType,
        isInSelectedAntisensePair,
      });
    } else if (node instanceof Nucleoside) {
      labeledNodes.push({
        type: Entities.Nucleoside,
        baseLabel: node?.rnaBase?.label,
        sugarLabel: node?.sugar?.label,
        rnaBaseMonomerItem:
          node.rnaBase instanceof AmbiguousMonomer
            ? node.rnaBase.variantMonomerItem
            : node.rnaBase.monomerItem,
        isNucleosideConnectedAndSelectedWithPhosphate,
        hasR1Connection,
        nodeIndexOverall,
        strandType,
        isInSelectedAntisensePair,
      });
    } else if (node?.monomer instanceof Phosphate) {
      labeledNodes.push({
        type: Entities.Phosphate,
        phosphateLabel: node?.monomer?.label,
        nodeIndexOverall,
        strandType,
        isInSelectedAntisensePair,
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
  selections: NodesSelection | undefined,
  t: TFunction,
) => {
  if (!selections?.length) return;

  const selectionsFlatten: NodeSelection[] = filterSelectionsToTargetedStrand(
    flatten(selections),
  );
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
      ? t('contextMenu.sequenceItem.nucleotidesCount', {
          count: countOfNucleoelements,
        })
      : t('contextMenu.sequenceItem.elementsCount', {
          count: countOfSelections,
        });
  }

  return {
    title,
    selectedSequenceLabeledNodes,
    isSelectedOnlyNucleoelements,
    isSelectedAtLeastOneNucleoelement,
    isSequenceFirstsOnlyNucleoelementsSelected,
  };
};

export function isEstablishHydrogenBondDisabled(
  selections: NodesSelection = [],
) {
  return selections.every((selectionRange) => {
    return selectionRange.every((selection) => {
      return isTwoStrandedNodeRestrictedForHydrogenBondCreation(
        selection.twoStrandedNode,
      );
    });
  });
}

export function isNodeContainHydrogenBonds(node: SequenceNode | undefined) {
  return node?.monomers.some((monomer) => monomer.hydrogenBonds.length !== 0);
}
