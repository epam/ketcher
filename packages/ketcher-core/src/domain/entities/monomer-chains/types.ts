import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';

export type SubChainNode = MonomerSequenceNode | Nucleoside | Nucleotide;
