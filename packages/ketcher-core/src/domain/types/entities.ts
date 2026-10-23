import type { PolymerBond } from 'domain/entities/PolymerBond';
import type { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import type { HydrogenBond } from 'domain/entities/HydrogenBond';

export enum Entities {
  Nucleotide = 'Nucleotide',
  Nucleoside = 'Nucleoside',
  Phosphate = 'Phosphate',
}

export type MonomerBond = PolymerBond | MonomerToAtomBond | HydrogenBond;
