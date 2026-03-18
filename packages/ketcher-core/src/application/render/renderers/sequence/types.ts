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
