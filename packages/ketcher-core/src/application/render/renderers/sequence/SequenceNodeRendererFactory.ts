import {
  Chem,
  Peptide,
  Phosphate,
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
  BaseSequenceItemRenderer,
  NucleosideSequenceItemRenderer,
  UnresolvedMonomerSequenceItemRenderer,
  UnsplitNucleotideSequenceItemRenderer,
} from 'application/render';
import { AmbiguousMonomerSequenceNode } from 'domain/entities/AmbiguousMonomerSequenceNode';
import { AmbiguousSequenceItemRenderer } from 'application/render/renderers/sequence/AmbiguousSequenceItemRenderer';
import { BackBoneSequenceItemRenderer } from 'application/render/renderers/sequence/BackBoneSequenceItemRenderer';
import { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';
import { SequenceNodeOptions } from './types';

export class SequenceNodeRendererFactory {
  static fromNode<T = BaseSequenceItemRenderer>(
    options: SequenceNodeOptions,
  ): T {
    switch (options.node.constructor) {
      case Nucleotide:
        return new NucleotideSequenceItemRenderer(options) as unknown as T;
      case Nucleoside:
        return new NucleosideSequenceItemRenderer(options) as unknown as T;
      case EmptySequenceNode:
        return new EmptySequenceItemRenderer(options) as unknown as T;
      case BackBoneSequenceNode:
        return new BackBoneSequenceItemRenderer(options) as unknown as T;
      case LinkerSequenceNode:
        return new ChemSequenceItemRenderer(options) as unknown as T;
      case AmbiguousMonomerSequenceNode:
        return new AmbiguousSequenceItemRenderer(options) as unknown as T;
      default:
        switch (options.node.monomer.constructor) {
          case Phosphate:
            return new PhosphateSequenceItemRenderer(options) as unknown as T;
          case Peptide:
            return new PeptideSequenceItemRenderer(options) as unknown as T;
          case Chem:
            return new ChemSequenceItemRenderer(options) as unknown as T;
          case UnresolvedMonomer:
            return new UnresolvedMonomerSequenceItemRenderer(
              options,
            ) as unknown as T;
          case UnsplitNucleotide:
            return new UnsplitNucleotideSequenceItemRenderer(
              options,
            ) as unknown as T;
          default:
            return new ChemSequenceItemRenderer(options) as unknown as T;
        }
    }
  }
}
