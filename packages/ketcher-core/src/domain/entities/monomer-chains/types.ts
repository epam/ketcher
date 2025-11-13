import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { LinkerSequenceNode } from 'domain/entities';
import { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';
import { AmbiguousMonomerSequenceNode } from 'domain/entities/AmbiguousMonomerSequenceNode';

export type SubChainNode =
  | MonomerSequenceNode
  | Nucleoside
  | Nucleotide
  | EmptySequenceNode
  | LinkerSequenceNode
  | AmbiguousMonomerSequenceNode;

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
