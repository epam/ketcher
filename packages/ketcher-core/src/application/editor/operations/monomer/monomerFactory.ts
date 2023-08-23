import {
  PeptideRenderer,
  ChemRenderer,
  BaseMonomerRenderer,
  RNABaseRenderer,
  SugarRenderer,
  PhosphateRenderer,
} from 'application/render/renderers';
import { MonomerItemType } from 'domain/types';
import { Peptide } from 'domain/entities/Peptide';
import { Chem } from 'domain/entities/Chem';
import { Sugar } from 'domain/entities/Sugar';
import { Phosphate } from 'domain/entities/Phosphate';
import { RNABase } from 'domain/entities/RNABase';
import { BaseMonomer } from 'domain/entities/BaseMonomer';

type DerivedClass<T> = new (...args: unknown[]) => T;

export const monomerFactory = (
  monomer: MonomerItemType,
): [
  Monomer: typeof BaseMonomer,
  MonomerRenderer: DerivedClass<BaseMonomerRenderer>,
] => {
  let Monomer;
  let MonomerRenderer;

  if (monomer.props.MonomerType === 'CHEM') {
    Monomer = Chem;
    MonomerRenderer = ChemRenderer;
  } else if (monomer.props.MonomerType === 'PEPTIDE') {
    Monomer = Peptide;
    MonomerRenderer = PeptideRenderer;
  } else {
    if (monomer.props.MonomerNaturalAnalogCode === 'R') {
      Monomer = Sugar;
      MonomerRenderer = SugarRenderer;
    } else if (monomer.props.MonomerNaturalAnalogCode === 'P') {
      Monomer = Phosphate;
      MonomerRenderer = PhosphateRenderer;
    } else {
      Monomer = RNABase;
      MonomerRenderer = RNABaseRenderer;
    }
  }

  return [Monomer, MonomerRenderer];
};
