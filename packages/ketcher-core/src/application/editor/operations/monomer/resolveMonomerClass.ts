import { MonomerItemType } from 'domain/types';
import {
  MONOMER_CONST,
  rnaDnaNaturalAnalogues,
  unknownNaturalAnalogues,
} from 'domain/constants/monomers';
import { KetMonomerClass } from 'application/formatters/types/ket';

export const resolveMonomerClass = (
  monomer: MonomerItemType,
): KetMonomerClass => {
  if (
    monomer.props.MonomerClass === KetMonomerClass.RNA ||
    monomer.props.MonomerClass === KetMonomerClass.DNA
  ) {
    return KetMonomerClass.RNA;
  }

  if (
    monomer.props.MonomerClass === KetMonomerClass.AminoAcid ||
    monomer.props.MonomerType === MONOMER_CONST.PEPTIDE
  ) {
    return KetMonomerClass.AminoAcid;
  }

  if (
    monomer.props.MonomerClass === KetMonomerClass.Sugar ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.R)
  ) {
    return KetMonomerClass.Sugar;
  }

  if (
    monomer.props.MonomerClass === KetMonomerClass.Phosphate ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.P)
  ) {
    return KetMonomerClass.Phosphate;
  }

  if (
    monomer.props.MonomerClass === KetMonomerClass.Base ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      [...rnaDnaNaturalAnalogues, ...unknownNaturalAnalogues].includes(
        monomer.props.MonomerNaturalAnalogCode,
      ))
  ) {
    return KetMonomerClass.Base;
  }

  return KetMonomerClass.CHEM;
};
