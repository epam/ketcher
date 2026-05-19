import { ChemSequenceItemRenderer } from './ChemSequenceItemRenderer';
import { EmptySequenceItemRenderer } from './EmptySequenceItemRenderer';
import { NucleosideSequenceItemRenderer } from './NucleosideSequenceItemRenderer';
import { NucleotideSequenceItemRenderer } from './NucleotideSequenceItemRenderer';
import { PeptideSequenceItemRenderer } from './PeptideSequenceItemRenderer';
import { PhosphateSequenceItemRenderer } from './PhosphateSequenceItemRenderer';
import { UnresolvedMonomerSequenceItemRenderer } from './UnresolvedMonomerSequenceItemRenderer';
import { UnsplitNucleotideSequenceItemRenderer } from './UnsplitNucleotideSequenceItemRenderer';
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
