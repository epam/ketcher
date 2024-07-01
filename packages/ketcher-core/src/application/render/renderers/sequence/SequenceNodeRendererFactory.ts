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
import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';

export class SequenceNodeRendererFactory {
  static fromNode(
    node: SubChainNode,
    firstMonomerInChainPosition: Vec2,
    monomerIndexInChain: number,
    isLastMonomerInChain: boolean,
    subChain: BaseSubChain,
    isEditingSymbol: boolean,
    renderer?: BaseMonomerRenderer | BaseSequenceItemRenderer,
  ) {
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
      case LinkerSequenceNode:
        RendererClass = ChemSequenceItemRenderer;
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
      node,
      firstMonomerInChainPosition,
      monomerIndexInChain,
      isLastMonomerInChain,
      subChain,
      isEditingSymbol,
      renderer?.monomerSize,
      renderer?.scaledMonomerPosition,
    );
  }
}
