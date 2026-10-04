import { Chem } from 'domain/entities/Chem';
import { Peptide } from 'domain/entities/Peptide';
import { Phosphate } from 'domain/entities/Phosphate';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { LinkerSequenceNode } from 'domain/entities/LinkerSequenceNode';
import { UnresolvedMonomer } from 'domain/entities/UnresolvedMonomer';
import { UnsplitNucleotide } from 'domain/entities/UnsplitNucleotide';
import { Vec2 } from 'domain/entities/vec2';
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

const DEFAULT_MONOMER_SIZE = { width: 0, height: 0 };
const DEFAULT_SCALED_MONOMER_POSITION = new Vec2(0, 0);

type SequenceNodeRendererConstructor<
  TNode extends SequenceNode,
  TRenderer extends BaseSequenceItemRenderer,
> = new (
  node: TNode,
  firstMonomerInChainPosition: Vec2,
  monomerIndexInChain: number,
  isLastMonomerInChain: boolean,
  chain: Chain,
  nodeIndexOverall: number,
  editingNodeIndexOverall: number,
  monomerSize: { width: number; height: number },
  scaledMonomerPosition: Vec2,
  twoStrandedNode: ITwoStrandedChainItem,
  previousRowsWithAntisense?: number,
) => TRenderer;

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
    const monomerSize = renderer?.monomerSize ?? DEFAULT_MONOMER_SIZE;
    const scaledMonomerPosition =
      renderer?.scaledMonomerPosition ?? DEFAULT_SCALED_MONOMER_POSITION;

    const createRenderer = <
      TNode extends SequenceNode,
      TRenderer extends BaseSequenceItemRenderer,
    >(
      RendererClass: SequenceNodeRendererConstructor<TNode, TRenderer>,
      rendererNode: TNode,
    ): BaseSequenceItemRenderer =>
      new RendererClass(
        rendererNode,
        firstMonomerInChainPosition,
        monomerIndexInChain,
        isLastMonomerInChain,
        chain,
        nodeIndexOverall,
        editingNodeIndexOverall,
        monomerSize,
        scaledMonomerPosition,
        twoStrandedNode,
        previousRowsWithAntisense,
      );

    if (node instanceof Nucleotide) {
      return createRenderer(NucleotideSequenceItemRenderer, node);
    }

    if (node instanceof Nucleoside) {
      return createRenderer(NucleosideSequenceItemRenderer, node);
    }

    if (node instanceof EmptySequenceNode) {
      return createRenderer(EmptySequenceItemRenderer, node);
    }

    if (node instanceof BackBoneSequenceNode) {
      return createRenderer(BackBoneSequenceItemRenderer, node);
    }

    if (node instanceof LinkerSequenceNode) {
      return createRenderer(ChemSequenceItemRenderer, node);
    }

    if (node instanceof AmbiguousMonomerSequenceNode) {
      return createRenderer(AmbiguousSequenceItemRenderer, node);
    }

    if (node.monomer instanceof Phosphate) {
      return createRenderer(PhosphateSequenceItemRenderer, node);
    }

    if (node.monomer instanceof Peptide) {
      return createRenderer(PeptideSequenceItemRenderer, node);
    }

    if (node.monomer instanceof UnresolvedMonomer) {
      return createRenderer(UnresolvedMonomerSequenceItemRenderer, node);
    }

    if (node.monomer instanceof UnsplitNucleotide) {
      return createRenderer(UnsplitNucleotideSequenceItemRenderer, node);
    }

    if (node.monomer instanceof Chem) {
      return createRenderer(ChemSequenceItemRenderer, node);
    }

    return createRenderer(ChemSequenceItemRenderer, node);
  }
}
