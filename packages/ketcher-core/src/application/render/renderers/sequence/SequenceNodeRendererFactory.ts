import { ConcreteMonomer } from 'domain/types';
import {
  Chem,
  Peptide,
  Phosphate,
  RNABase,
  Sugar,
  Vec2,
} from 'domain/entities';
import { PeptideSequenceItemRenderer } from 'application/render/renderers/sequence/PeptideSequenceItemRenderer';
import { ChemSequenceItemRenderer } from 'application/render/renderers/sequence/ChemSequenceItemRenderer';
import { RnaBaseSequenceItemRenderer } from 'application/render/renderers/sequence/RnaBaseSequenceItemRenderer';
import { PhosphateSequenceItemRenderer } from 'application/render/renderers/sequence/PhosphateSequenceItemRenderer';
import { NucleotideSequenceItemRenderer } from 'application/render/renderers/sequence/NucleotideSequenceItemRenderer';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';

export class SequenceNodeRendererFactory {
  static fromNode(
    node: SubChainNode,
    firstMonomerInChainPosition: Vec2,
    monomerIndexInChain: number,
    monomerNumberInSubChain: number,
    // isLastMonomerInChain: boolean,
  ) {
    let RendererClass;

    switch (node.constructor) {
      case Nucleotide:
        RendererClass = NucleotideSequenceItemRenderer;
        break;
      case Nucleoside:
        RendererClass = NucleotideSequenceItemRenderer;
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
          default:
            RendererClass = ChemSequenceItemRenderer;
            break;
        }
    }

    return new RendererClass(
      node,
      firstMonomerInChainPosition,
      monomerIndexInChain,
      monomerNumberInSubChain,
      // isLastMonomerInChain,
    );
  }
}
