import {
  PeptideRenderer,
  ChemRenderer,
  BaseMonomerRenderer,
} from 'application/render/renderers';
import { MonomerItemType } from 'domain/types';
import { Peptide } from 'domain/entities/Peptide';
import { Chem } from 'domain/entities/Chem';
import { BaseMonomer } from 'domain/entities/BaseMonomer';

export const monomerFactory = (
  peptide: MonomerItemType,
): [Monomer: BaseMonomer, MonomerRenderer: BaseMonomerRenderer] => {
  let Monomer;
  let MonomerRenderer;
  switch (peptide.props.MonomerType) {
    case 'CHEM':
      Monomer = Chem;
      MonomerRenderer = ChemRenderer;
      break;
    default:
      Monomer = Peptide;
      MonomerRenderer = PeptideRenderer;
  }

  return [Monomer, MonomerRenderer];
};
