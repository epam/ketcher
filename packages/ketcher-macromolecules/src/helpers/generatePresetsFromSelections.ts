import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { RNABase, Sugar, Phosphate } from 'ketcher-core';
import { NodeSelection } from 'ketcher-core/dist/application/render/renderers/sequence/SequenceRenderer';

type IRnaPresetWithPositionInSequence = IRnaPreset &
  Pick<NodeSelection, 'chainIndex' | 'nodeIndex'>;

// TODO: optimize? remove name
export const generatePresetsFromSelections = (
  selectionsFlatten: NodeSelection[],
  // name?: string,
): IRnaPresetWithPositionInSequence[] => {
  const nucleotides: IRnaPresetWithPositionInSequence[] = [];
  let nucleotideToFill: IRnaPresetWithPositionInSequence = {};

  for (const selection of selectionsFlatten) {
    const { chainIndex, nodeIndex } = selection;

    for (const property in selection.node) {
      const monomerTemp = selection.node[property];
      const { struct, props, label } = monomerTemp.monomerItem;
      let monomerType!: 'base' | 'sugar' | 'phosphate';
      if (monomerTemp instanceof RNABase) {
        monomerType = 'base';
      } else if (monomerTemp instanceof Sugar) {
        monomerType = 'sugar';
      } else if (monomerTemp instanceof Phosphate) {
        monomerType = 'phosphate';
      }
      if (monomerType) {
        nucleotideToFill[monomerType] = {
          label,
          struct,
          props,
        };
      }
    }
    nucleotides.push({
      ...nucleotideToFill,
      chainIndex,
      nodeIndex,
    });
    nucleotideToFill = {};
  }

  return nucleotides;
};
