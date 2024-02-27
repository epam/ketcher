import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';

export type SubChainNode =
  | MonomerSequenceNode
  | Nucleoside
  | Nucleotide
  | EmptySequenceNode;
