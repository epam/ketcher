import type { ChemSequenceItemRenderer } from './ChemSequenceItemRenderer';
import type { EmptySequenceItemRenderer } from './EmptySequenceItemRenderer';
import type { NucleosideSequenceItemRenderer } from './NucleosideSequenceItemRenderer';
import type { NucleotideSequenceItemRenderer } from './NucleotideSequenceItemRenderer';
import type { PeptideSequenceItemRenderer } from './PeptideSequenceItemRenderer';
import type { PhosphateSequenceItemRenderer } from './PhosphateSequenceItemRenderer';
import type { UnresolvedMonomerSequenceItemRenderer } from './UnresolvedMonomerSequenceItemRenderer';
import type { UnsplitNucleotideSequenceItemRenderer } from './UnsplitNucleotideSequenceItemRenderer';
import type { AmbiguousSequenceItemRenderer } from 'application/render/renderers/sequence/AmbiguousSequenceItemRenderer';

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
