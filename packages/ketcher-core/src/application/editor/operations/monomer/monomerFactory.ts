import {
  PeptideRenderer,
  ChemRenderer,
  BaseMonomerRenderer,
  RNABaseRenderer,
  SugarRenderer,
  PhosphateRenderer,
  UnresolvedMonomerRenderer,
  UnsplitNucleotideRenderer,
} from 'application/render/renderers';
import { MonomerItemType } from 'domain/types';
import {
  Peptide,
  Chem,
  Sugar,
  Phosphate,
  RNABase,
  UnresolvedMonomer,
  UnsplitNucleotide,
} from 'domain/entities';
import { KetMonomerClass } from 'application/formatters/types/ket';

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
  monomer: MonomerItemType,
): [
  Monomer: Monomer,
  MonomerRenderer: DerivedClass<BaseMonomerRenderer>,
  ketMonomerClass: KetMonomerClass,
] => {
  let Monomer;
  let MonomerRenderer;
  let ketMonomerClass: KetMonomerClass;

  if (monomer.props.unresolved) {
    Monomer = UnresolvedMonomer;
    MonomerRenderer = UnresolvedMonomerRenderer;
    ketMonomerClass = KetMonomerClass.CHEM;
  } else if (
    monomer.props.MonomerType === MONOMER_CONST.CHEM ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      (monomer.props.MonomerClass === MONOMER_CONST.MODDNA ||
        monomer.props.MonomerClass === MONOMER_CONST.DNA))
  ) {
    Monomer = Chem;
    MonomerRenderer = ChemRenderer;
    ketMonomerClass = KetMonomerClass.CHEM;
  } else if (
    monomer.props.MonomerClass === MONOMER_CONST.RNA ||
    monomer.props.MonomerClass === MONOMER_CONST.DNA
  ) {
    Monomer = UnsplitNucleotide;
    MonomerRenderer = UnsplitNucleotideRenderer;
    ketMonomerClass = KetMonomerClass.RNA;
  } else if (monomer.props.MonomerType === MONOMER_CONST.PEPTIDE) {
    Monomer = Peptide;
    MonomerRenderer = PeptideRenderer;
    ketMonomerClass = KetMonomerClass.AminoAcid;
  } else {
    if (monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.R) {
      Monomer = Sugar;
      MonomerRenderer = SugarRenderer;
      ketMonomerClass = KetMonomerClass.Sugar;
    } else if (monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.P) {
      Monomer = Phosphate;
      MonomerRenderer = PhosphateRenderer;
      ketMonomerClass = KetMonomerClass.Phosphate;
    } else {
      Monomer = RNABase;
      MonomerRenderer = RNABaseRenderer;
      ketMonomerClass = KetMonomerClass.Base;
    }
  }

  return [Monomer, MonomerRenderer, ketMonomerClass];
};
