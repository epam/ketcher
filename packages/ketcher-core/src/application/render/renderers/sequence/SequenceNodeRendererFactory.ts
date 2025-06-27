import {
  Chem,
  Peptide,
  Phosphate,
  Vec2,
  Nucleotide,
  Nucleoside,
  EmptySequenceNode,
  LinkerSequenceNode,
  UnresolvedMonomer,
  UnsplitNucleotide,
} from 'domain/entities';
import {
  PeptideSequenceItemRenderer,
  ChemSequenceItemRenderer,
  PhosphateSequenceItemRenderer,
  NucleotideSequenceItemRenderer,
  EmptySequenceItemRenderer,
  BaseMonomerRenderer,
  BaseSequenceItemRenderer,
  NucleosideSequenceItemRenderer,
  UnresolvedMonomerSequenceItemRenderer,
  UnsplitNucleotideSequenceItemRenderer,
} from 'application/render';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { AmbiguousMonomerSequenceNode } from 'domain/entities/AmbiguousMonomerSequenceNode';
import { AmbiguousSequenceItemRenderer } from 'application/render/renderers/sequence/AmbiguousSequenceItemRenderer';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import { BackBoneSequenceItemRenderer } from 'application/render/renderers/sequence/BackBoneSequenceItemRenderer';
import { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';
import { ITwoStrandedChainItem } from 'domain/entities/monomer-chains/ChainsCollection';

export class SequenceNodeRendererFactory {
  static fromNode(
    coreEditorId: string,
    node: SubChainNode | BackBoneSequenceNode,
    firstMonomerInChainPosition: Vec2,
    monomerIndexInChain: number,
    isLastMonomerInChain: boolean,
    chain: Chain,
    nodeIndexOverall: number,
    editingNodeIndexOverall: number,
    previousRowsWithAntisense = 0,
    twoStrandedNode: ITwoStrandedChainItem,
    renderer?: BaseMonomerRenderer | BaseSequenceItemRenderer,
  ): BaseSequenceItemRenderer {
    let RendererClass;

    switch (node.constructor) {
      case Nucleotide:
        RendererClass = NucleotideSequenceItemRenderer;
        break;
      case Nucleoside:
        RendererClass = NucleosideSequenceItemRenderer;
        break;
      case EmptySequenceNode:
        RendererClass = EmptySequenceItemRenderer;
        break;
      case BackBoneSequenceNode:
        RendererClass = BackBoneSequenceItemRenderer;
        break;
      case LinkerSequenceNode:
        RendererClass = ChemSequenceItemRenderer;
        break;
      case AmbiguousMonomerSequenceNode:
        RendererClass = AmbiguousSequenceItemRenderer;
        break;
      default:
        switch (node.monomer.constructor) {
          case Phosphate:
            RendererClass = PhosphateSequenceItemRenderer;
            break;
          case Peptide:
            RendererClass = PeptideSequenceItemRenderer;
            break;
          case Chem:
            RendererClass = ChemSequenceItemRenderer;
            break;
          case UnresolvedMonomer:
            RendererClass = UnresolvedMonomerSequenceItemRenderer;
            break;
          case UnsplitNucleotide:
            RendererClass = UnsplitNucleotideSequenceItemRenderer;
            break;
          default:
            RendererClass = ChemSequenceItemRenderer;
            break;
        }
    }

    return new RendererClass(
      coreEditorId,
      node,
      firstMonomerInChainPosition,
      monomerIndexInChain,
      isLastMonomerInChain,
      chain,
      nodeIndexOverall,
      editingNodeIndexOverall,
      renderer?.monomerSize,
      renderer?.scaledMonomerPosition,
      previousRowsWithAntisense,
      twoStrandedNode,
    );
  }
}
