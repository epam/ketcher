export type Point = {
  x: number;
  y: number;
};

export enum MonomerType {
  Peptide = 'AminoAcid',
  Sugar = 'Sugar',
  Base = 'Base',
  Phosphate = 'Phosphate',
  UnresovedNucleotide = 'RNA',
  CHEM = 'CHEM',
  UnknownMonomer = 'CHEM',
  Molecule = 'CHEM',
}

export enum MacroBondType {
  Single = 'covalent',
  Hydrogen = 'hydrogen',
}
