import { MonomerItemType } from 'domain/types';
import { KetMonomerClass } from 'application/formatters/types/ket';
import { MONOMER_CONST } from 'domain/constants/monomers';

export function isMonomerItemSugar(monomer: MonomerItemType): boolean {
  return (
    monomer.props.MonomerClass === KetMonomerClass.Sugar ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.R)
  );
}

export function isMonomerItemPhosphate(monomer: MonomerItemType): boolean {
  return (
    monomer.props.MonomerClass === KetMonomerClass.Phosphate ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.P)
  );
}
