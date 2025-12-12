import {
  ChemSequenceItemRenderer,
  EmptySequenceItemRenderer,
  NucleosideSequenceItemRenderer,
  NucleotideSequenceItemRenderer,
  PeptideSequenceItemRenderer,
  PhosphateSequenceItemRenderer,
  UnresolvedMonomerSequenceItemRenderer,
  UnsplitNucleotideSequenceItemRenderer,
} from 'application/render';
import { AmbiguousSequenceItemRenderer } from 'application/render/renderers/sequence/AmbiguousSequenceItemRenderer';
import {
  Chain,
  ITwoStrandedChainItem,
  SequenceNode,
  Vec2,
} from 'domain/entities';

export type SequenceItemRenderer =
  | NucleotideSequenceItemRenderer
  | NucleosideSequenceItemRenderer
  | EmptySequenceItemRenderer
  | ChemSequenceItemRenderer
  | PeptideSequenceItemRenderer
  | PhosphateSequenceItemRenderer
  | UnresolvedMonomerSequenceItemRenderer
  | UnsplitNucleotideSequenceItemRenderer
  | AmbiguousSequenceItemRenderer;

export interface SequenceNodeOptions {
  node: SequenceNode;
  firstMonomerInChainPosition: Vec2;
  monomerIndexInChain: number;
  isLastMonomerInChain: boolean;
  chain: Chain;
  nodeIndexOverall: number;
  editingNodeIndexOverall: number;
  twoStrandedNode: ITwoStrandedChainItem;
  monomerSize?: { width: number; height: number };
  scaledMonomerPosition?: Vec2;
  previousRowsWithAntisense: number;
}
