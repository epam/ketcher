import { Chem } from 'domain/entities/Chem';
import { Peptide } from 'domain/entities/Peptide';
import { Phosphate } from 'domain/entities/Phosphate';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { LinkerSequenceNode } from 'domain/entities/LinkerSequenceNode';
import { UnresolvedMonomer } from 'domain/entities/UnresolvedMonomer';
import { UnsplitNucleotide } from 'domain/entities/UnsplitNucleotide';
import type { Vec2 } from 'domain/entities/vec2';
import { PeptideSequenceItemRenderer } from './PeptideSequenceItemRenderer';
import { ChemSequenceItemRenderer } from './ChemSequenceItemRenderer';
import { PhosphateSequenceItemRenderer } from './PhosphateSequenceItemRenderer';
import { NucleotideSequenceItemRenderer } from './NucleotideSequenceItemRenderer';
import { EmptySequenceItemRenderer } from './EmptySequenceItemRenderer';
import type { BaseMonomerRenderer } from '../BaseMonomerRenderer';
import type { BaseSequenceItemRenderer } from './BaseSequenceItemRenderer';
import { NucleosideSequenceItemRenderer } from './NucleosideSequenceItemRenderer';
import { UnresolvedMonomerSequenceItemRenderer } from './UnresolvedMonomerSequenceItemRenderer';
import { UnsplitNucleotideSequenceItemRenderer } from './UnsplitNucleotideSequenceItemRenderer';
import type { SequenceNode } from 'domain/entities/monomer-chains/types';
import { AmbiguousMonomerSequenceNode } from 'domain/entities/AmbiguousMonomerSequenceNode';
import { AmbiguousSequenceItemRenderer } from 'application/render/renderers/sequence/AmbiguousSequenceItemRenderer';
import type { Chain } from 'domain/entities/monomer-chains/Chain';
import { BackBoneSequenceItemRenderer } from 'application/render/renderers/sequence/BackBoneSequenceItemRenderer';
import { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';
import type { ITwoStrandedChainItem } from 'domain/entities/monomer-chains/ChainsCollection';

export class SequenceNodeRendererFactory {
  /**
   * Determines the appropriate renderer class for a linker node.
   *
   * A linker composed only of phosphate monomers at the first or last position
   * of the chain renders as P (PhosphateSequenceItemRenderer), because terminal
   * phosphates are chemically meaningful, especially on antisense strands.
   * Interior phosphate-only linkers continue rendering as CHEM (ChemSequenceItemRenderer).
   *
   * @see https://github.com/epam/ketcher/issues/6438
   * @param node - The linker sequence node to render
   * @param monomerIndexInChain - Zero-based position in the chain
   * @param isLastMonomerInChain - Whether this is the last monomer in the chain
   * @returns The appropriate renderer class (PhosphateSequenceItemRenderer or ChemSequenceItemRenderer)
   *
   * Public for testing purposes.
   */
  public static getLinkerRendererClass(
    node: LinkerSequenceNode,
    monomerIndexInChain: number,
    isLastMonomerInChain: boolean,
  ) {
    // Terminal phosphates (first or last position) are chemically significant
    const isAtEdgeOfChain = monomerIndexInChain === 0 || isLastMonomerInChain;

    return node.isPhosphateOnly && isAtEdgeOfChain
      ? PhosphateSequenceItemRenderer
      : ChemSequenceItemRenderer;
  }

  static fromNode(
    node: SequenceNode,
    firstMonomerInChainPosition: Vec2,
    monomerIndexInChain: number,
    isLastMonomerInChain: boolean,
    chain: Chain,
    nodeIndexOverall: number,
    editingNodeIndexOverall: number,
    twoStrandedNode: ITwoStrandedChainItem,
    renderer?: BaseMonomerRenderer | BaseSequenceItemRenderer,
    previousRowsWithAntisense = 0,
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
        RendererClass = SequenceNodeRendererFactory.getLinkerRendererClass(
          node as LinkerSequenceNode,
          monomerIndexInChain,
          isLastMonomerInChain,
        );
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
          case UnresolvedMonomer:
            RendererClass = UnresolvedMonomerSequenceItemRenderer;
            break;
          case UnsplitNucleotide:
            RendererClass = UnsplitNucleotideSequenceItemRenderer;
            break;
          case Chem:
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
      chain,
      nodeIndexOverall,
      editingNodeIndexOverall,
      renderer?.monomerSize,
      renderer?.scaledMonomerPosition,
      twoStrandedNode,
      previousRowsWithAntisense,
    );
  }
}
