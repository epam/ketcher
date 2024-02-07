import { BaseMonomer, Peptide, Phosphate, Sugar } from 'domain/entities';
import { AttachmentPointName, MonomerItemType } from 'domain/types';

export function getMonomerUniqueKey(monomer: MonomerItemType) {
  return `${monomer.props.MonomerName}___${monomer.props.Name}`;
}

export function checkIsR2R1Connection(
  monomer: BaseMonomer,
  nextMonomer: BaseMonomer,
) {
  return (
    nextMonomer.attachmentPointsToBonds.R1?.getAnotherMonomer(nextMonomer) ===
    monomer
  );
}

export function getNextMonomerInChain(monomer?: BaseMonomer) {
  if (!monomer) return undefined;

  const r2PolymerBond = monomer.attachmentPointsToBonds.R2;

  return r2PolymerBond?.getAnotherMonomer(monomer);
}

export function getRnaBaseMonomerFromSugar(monomer?: BaseMonomer) {
  if (!monomer) return undefined;
  const r3PolymerBond = monomer.attachmentPointsToBonds.R3;
  const rnaBaseMonomer = r3PolymerBond?.getAnotherMonomer(monomer);
  return rnaBaseMonomer;
}

export function isMonomerBeginningOfChain(
  monomer: BaseMonomer,
  MonomerTypes: Array<typeof Peptide | typeof Phosphate | typeof Sugar>,
) {
  const r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  const previousMonomer = r1PolymerBond?.getAnotherMonomer(monomer);
  const isPreviousMonomerPartOfChain =
    previousMonomer &&
    !MonomerTypes.some((MonomerType) => previousMonomer instanceof MonomerType);
  const previousConnectionNotR2 =
    r1PolymerBond &&
    previousMonomer?.getAttachmentPointByBond(r1PolymerBond) !== 'R2';

  return (
    ((monomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) ||
      !monomer.hasAttachmentPoint(AttachmentPointName.R1)) &&
      monomer.hasBonds) ||
    previousConnectionNotR2 ||
    isPreviousMonomerPartOfChain
  );
}
