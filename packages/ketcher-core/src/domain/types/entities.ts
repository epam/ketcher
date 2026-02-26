import { PolymerBond } from 'domain/entities/PolymerBond';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { HydrogenBond } from 'domain/entities/HydrogenBond';

export enum Entities {
  Nucleotide = 'Nucleotide',
  Nucleoside = 'Nucleoside',
  Phosphate = 'Phosphate',
}

export type MonomerBond = PolymerBond | MonomerToAtomBond | HydrogenBond;
