import {
  AmbiguousMonomerRenderer,
  BaseMonomerRenderer,
  ChemRenderer,
  PeptideRenderer,
  PhosphateRenderer,
  RNABaseRenderer,
  SugarRenderer,
  UnresolvedMonomerRenderer,
  UnsplitNucleotideRenderer,
} from 'application/render/renderers';
import { MonomerOrAmbiguousType } from 'domain/types';
import {
  AmbiguousMonomer,
  Chem,
  Peptide,
  Phosphate,
  RNABase,
  Sugar,
  UnresolvedMonomer,
  UnsplitNucleotide,
} from 'domain/entities';
import { KetMonomerClass } from 'application/formatters/types/ket';
import { isAmbiguousMonomerLibraryItem } from 'domain/helpers/monomers';

type DerivedClass<T> = new (...args: unknown[]) => T;
export const MONOMER_CONST = {
  AMINO_ACID: 'AminoAcid',
  PEPTIDE: 'PEPTIDE',
  CHEM: 'CHEM',
  RNA: 'RNA',
  DNA: 'DNA',
  MODDNA: 'MODDNA',
  R: 'R', // states for Ribose
  P: 'P', // states for Phosphate
  SUGAR: 'SUGAR',
  BASE: 'BASE',
  PHOSPHATE: 'PHOSPHATE',
};

type Monomer =
  | typeof Chem
  | typeof Sugar
  | typeof Peptide
  | typeof RNABase
  | typeof Phosphate;

export const monomerFactory = (
  monomer: MonomerOrAmbiguousType,
): [
  Monomer: Monomer,
  MonomerRenderer: DerivedClass<BaseMonomerRenderer>,
  ketMonomerClass: KetMonomerClass,
] => {
  let Monomer;
  let MonomerRenderer;
  let ketMonomerClass: KetMonomerClass;

  if (isAmbiguousMonomerLibraryItem(monomer)) {
    Monomer = AmbiguousMonomer;
    MonomerRenderer = AmbiguousMonomerRenderer;
    ketMonomerClass = AmbiguousMonomer.getMonomerClass(monomer.monomers);
  } else if (monomer.props.unresolved) {
    Monomer = UnresolvedMonomer;
    MonomerRenderer = UnresolvedMonomerRenderer;
    ketMonomerClass = KetMonomerClass.CHEM;
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.RNA ||
    monomer.props.MonomerClass === KetMonomerClass.DNA
  ) {
    Monomer = UnsplitNucleotide;
    MonomerRenderer = UnsplitNucleotideRenderer;
    ketMonomerClass = KetMonomerClass.RNA;
  } else if (monomer.props.MonomerClass === KetMonomerClass.AminoAcid) {
    Monomer = Peptide;
    MonomerRenderer = PeptideRenderer;
    ketMonomerClass = KetMonomerClass.AminoAcid;
  } else if (monomer.props.MonomerClass === KetMonomerClass.Sugar) {
    Monomer = Sugar;
    MonomerRenderer = SugarRenderer;
    ketMonomerClass = KetMonomerClass.Sugar;
  } else if (monomer.props.MonomerClass === KetMonomerClass.Phosphate) {
    Monomer = Phosphate;
    MonomerRenderer = PhosphateRenderer;
    ketMonomerClass = KetMonomerClass.Phosphate;
  } else if (monomer.props.MonomerClass === KetMonomerClass.Base) {
    Monomer = RNABase;
    MonomerRenderer = RNABaseRenderer;
    ketMonomerClass = KetMonomerClass.Base;
  } else {
    Monomer = Chem;
    MonomerRenderer = ChemRenderer;
    ketMonomerClass = KetMonomerClass.CHEM;
  }

  return [Monomer, MonomerRenderer, ketMonomerClass];
};
