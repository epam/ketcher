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

type SequenceNodeRendererClass = new (
  ...args: unknown[]
) => BaseSequenceItemRenderer;

export class SequenceNodeRendererFactory {
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
    let RendererClass: SequenceNodeRendererClass;

    switch (node.constructor) {
      case Nucleotide:
        RendererClass =
          NucleotideSequenceItemRenderer as unknown as SequenceNodeRendererClass;
        break;
      case Nucleoside:
        RendererClass =
          NucleosideSequenceItemRenderer as unknown as SequenceNodeRendererClass;
        break;
      case EmptySequenceNode:
        RendererClass =
          EmptySequenceItemRenderer as unknown as SequenceNodeRendererClass;
        break;
      case BackBoneSequenceNode:
        RendererClass =
          BackBoneSequenceItemRenderer as unknown as SequenceNodeRendererClass;
        break;
      case LinkerSequenceNode:
        RendererClass =
          ChemSequenceItemRenderer as unknown as SequenceNodeRendererClass;
        break;
      case AmbiguousMonomerSequenceNode:
        RendererClass =
          AmbiguousSequenceItemRenderer as unknown as SequenceNodeRendererClass;
        break;
      default:
        switch (node.monomer.constructor) {
          case Phosphate:
            RendererClass =
              PhosphateSequenceItemRenderer as unknown as SequenceNodeRendererClass;
            break;
          case Peptide:
            RendererClass =
              PeptideSequenceItemRenderer as unknown as SequenceNodeRendererClass;
            break;
          case UnresolvedMonomer:
            RendererClass =
              UnresolvedMonomerSequenceItemRenderer as unknown as SequenceNodeRendererClass;
            break;
          case UnsplitNucleotide:
            RendererClass =
              UnsplitNucleotideSequenceItemRenderer as unknown as SequenceNodeRendererClass;
            break;
          case Chem:
          default:
            RendererClass =
              ChemSequenceItemRenderer as unknown as SequenceNodeRendererClass;
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
