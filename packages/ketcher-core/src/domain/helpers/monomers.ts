import {
  BaseMonomer,
  Peptide,
  Phosphate,
  RNABase,
  Sugar,
} from 'domain/entities';
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
  const nextMonomer = r2PolymerBond?.getAnotherMonomer(monomer);

  return r2PolymerBond &&
    nextMonomer?.getAttachmentPointByBond(r2PolymerBond) ===
      AttachmentPointName.R1
    ? nextMonomer
    : undefined;
}

export function getRnaBaseFromSugar(monomer?: BaseMonomer) {
  if (!monomer) return undefined;
  const r3PolymerBond = monomer.attachmentPointsToBonds.R3;
  const r3ConnectedMonomer = r3PolymerBond?.getAnotherMonomer(monomer);

  return r3ConnectedMonomer instanceof RNABase ? r3ConnectedMonomer : undefined;
}

export function getSugarFromRnaBase(monomer?: BaseMonomer) {
  if (!monomer) return undefined;
  const r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  const r1ConnectedMonomer = r1PolymerBond?.getAnotherMonomer(monomer);

  return r1ConnectedMonomer instanceof Sugar ? r1ConnectedMonomer : undefined;
}

export function getPhosphateFromSugar(monomer?: BaseMonomer) {
  if (!monomer) return undefined;
  const nextMonomerInChain = getNextMonomerInChain(monomer);

  return nextMonomerInChain instanceof Phosphate
    ? nextMonomerInChain
    : undefined;
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

export function isValidNucleotide(sugar: Sugar) {
  const phosphate = getPhosphateFromSugar(sugar);
  const nextMonomerAfterPhosphate = getNextMonomerInChain(phosphate);

  return Boolean(
    getRnaBaseFromSugar(sugar) &&
      getPhosphateFromSugar(sugar) &&
      nextMonomerAfterPhosphate,
  );
}

export function isValidNucleoside(sugar: Sugar) {
  const phosphate = getPhosphateFromSugar(sugar);
  const nextMonomerAfterPhosphate = getNextMonomerInChain(phosphate);

  return (
    getRnaBaseFromSugar(sugar) && (!phosphate || !nextMonomerAfterPhosphate)
  );
}
