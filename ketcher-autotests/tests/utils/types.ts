export type Point = {
  x: number;
  y: number;
};

export enum MonomerType {
  Peptide = 'AminoAcid',
  Sugar = 'Sugar',
  Base = 'Base',
  Phosphate = 'Phosphate',
  UnsplitNucleotide = 'RNA',
  CHEM = 'CHEM',
  UnknownMonomer = 'CHEM',
  Molecule = 'CHEM',
  Nucleotide = 'RNA',
  // Atom is for compatibility
  Atom = 'atom',
}

export enum MacroBondType {
  Single = 'covalent',
  Hydrogen = 'hydrogen',
}

export interface Monomer {
  alias: string;
  testId: string;
}
