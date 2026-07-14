import type { Nucleoside } from '../Nucleoside';
import type { Nucleotide } from '../Nucleotide';
import type { MonomerSequenceNode } from '../MonomerSequenceNode';
import type { EmptySequenceNode } from '../EmptySequenceNode';
import type { LinkerSequenceNode } from '../LinkerSequenceNode';
import type { BackBoneSequenceNode } from '../BackBoneSequenceNode';

export type SubChainNode =
  | MonomerSequenceNode
  | Nucleoside
  | Nucleotide
  | EmptySequenceNode
  | LinkerSequenceNode;

export type SequenceNode = SubChainNode | BackBoneSequenceNode;

export enum SequenceType {
  RNA = 'RNA',
  DNA = 'DNA',
  PEPTIDE = 'PEPTIDE',
}

export enum IsChainCycled {
  NOT_CYCLED,
  CYCLED,
}
