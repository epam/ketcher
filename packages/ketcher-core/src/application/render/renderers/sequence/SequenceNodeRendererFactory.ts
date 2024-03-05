import { Chem, Peptide, Phosphate, Vec2 } from 'domain/entities';
import { PeptideSequenceItemRenderer } from 'application/render/renderers/sequence/PeptideSequenceItemRenderer';
import { ChemSequenceItemRenderer } from 'application/render/renderers/sequence/ChemSequenceItemRenderer';
import { PhosphateSequenceItemRenderer } from 'application/render/renderers/sequence/PhosphateSequenceItemRenderer';
import { NucleotideSequenceItemRenderer } from 'application/render/renderers/sequence/NucleotideSequenceItemRenderer';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { SymbolEditingMode } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { EmptySequenceItemRenderer } from 'application/render/renderers/sequence/EmptySequenceItemRenderer';
import { BaseMonomerRenderer } from 'application/render';

export class SequenceNodeRendererFactory {
  static fromNode(
    node: SubChainNode,
    firstMonomerInChainPosition: Vec2,
    monomerIndexInChain: number,
    isLastMonomerInChain: boolean,
    isEditingSymbol: boolean,
    renderer: BaseMonomerRenderer,
  ) {
    let RendererClass;

    switch (node.constructor) {
      case Nucleotide:
        RendererClass = NucleotideSequenceItemRenderer;
        break;
      case Nucleoside:
        RendererClass = NucleotideSequenceItemRenderer;
        break;
      case EmptySequenceNode:
        RendererClass = EmptySequenceItemRenderer;
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
      isLastMonomerInChain,
      isEditingSymbol,
      renderer?.monomerSize,
      renderer?.scaledMonomerPosition
    );
  }
}
