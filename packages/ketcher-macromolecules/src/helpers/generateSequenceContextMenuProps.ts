import { flatten } from 'lodash';
import { Nucleotide, RNABase, SubChainNode } from 'ketcher-core';
import { generatePresetsFromSelections } from 'helpers/generatePresetsFromSelections';
import { NodesSelection } from 'ketcher-core/dist/application/render/renderers/sequence/SequenceRenderer';

const generateSequenceContextMenuProps = (selections: NodesSelection) => {
  const selectionsFlatten = flatten(selections);
  let title: string;
  let isSelectedAtLeastOneNucleotide = false;
  let isSelectedOnlyNucleotides = true;
  const selectionsCount = selectionsFlatten.length;
  console.log(
    'generateSequenceContextMenuProps selectionsFlatten',
    selectionsFlatten,
  );

  for (let i = 0; i < selectionsCount; i++) {
    if (selectionsFlatten[i].node instanceof Nucleotide) {
      isSelectedAtLeastOneNucleotide = true;
    } else {
      isSelectedOnlyNucleotides = false;
    }
  }

  // Generate menu title if selected one nucleotide
  const generateNucleotideTitle = (nucleotide: SubChainNode) => {
    let tempTitle = '';

    for (const property in nucleotide) {
      const propertyVal = nucleotide[property];
      const label = propertyVal.monomerItem.props.MonomerName;

      if (propertyVal instanceof RNABase) {
        tempTitle += `(${label})`;
      } else {
        tempTitle += label;
      }
    }

    return tempTitle;
  };

  // Set title based on selected elements
  if (selectionsCount === 1) {
    title = generateNucleotideTitle(selectionsFlatten[0].node);
  } else {
    const titleElementType = isSelectedOnlyNucleotides
      ? 'nucleotides'
      : 'elements';
    title = `${selectionsCount} ${titleElementType}`;
  }

  // Generate modified Monomers for RNA Builder
  const selectedNucleotideMonomers = generatePresetsFromSelections(
    selectionsFlatten,
    // title,
  );

  return {
    title,
    isSelectedOnlyNucleotides,
    isSelectedAtLeastOneNucleotide,
    selectedNucleotideMonomers,
  };
};

export default generateSequenceContextMenuProps;
