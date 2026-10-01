import type { Nucleoside } from 'domain/entities/Nucleoside';
import type { Nucleotide } from 'domain/entities/Nucleotide';
import type { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import type { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import type { LinkerSequenceNode } from 'domain/entities/LinkerSequenceNode';
import type { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';

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
