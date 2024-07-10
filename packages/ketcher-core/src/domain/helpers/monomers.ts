import {
  BaseMonomer,
  Peptide,
  Phosphate,
  RNABase,
  Sugar,
  UnsplitNucleotide,
} from 'domain/entities';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';

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

export function isR2R1ConnectionFromRnaBase(polymerBond: PolymerBond) {
  const firstMonomerAttachmentPoint =
    polymerBond.firstMonomer.getAttachmentPointByBond(polymerBond);
  const secondMonomerAttachmentPoint =
    polymerBond.secondMonomer?.getAttachmentPointByBond(polymerBond);

  return (
    (polymerBond.firstMonomer instanceof RNABase &&
      firstMonomerAttachmentPoint === AttachmentPointName.R2 &&
      secondMonomerAttachmentPoint === AttachmentPointName.R1) ||
    (polymerBond.secondMonomer instanceof RNABase &&
      secondMonomerAttachmentPoint === AttachmentPointName.R2 &&
      firstMonomerAttachmentPoint === AttachmentPointName.R1)
  );
}

export function isMonomerConnectedToR2RnaBase(monomer?: BaseMonomer) {
  if (!monomer) {
    return false;
  }

  const R1PolymerBond = monomer.attachmentPointsToBonds.R1;
  const R1ConnectedMonomer = R1PolymerBond?.getAnotherMonomer(monomer);

  return (
    R1ConnectedMonomer instanceof RNABase &&
    getSugarFromRnaBase(R1ConnectedMonomer) &&
    R1ConnectedMonomer.attachmentPointsToBonds.R2?.getAnotherMonomer(
      R1ConnectedMonomer,
    ) === monomer
  );
}

export function getNextMonomerInChain(
  monomer?: BaseMonomer,
  firstMonomer?: BaseMonomer | null,
) {
  if (!monomer) return undefined;

  const r2PolymerBond = monomer.attachmentPointsToBonds.R2;
  const nextMonomer = r2PolymerBond?.getAnotherMonomer(monomer);

  if (
    !nextMonomer ||
    (nextMonomer === firstMonomer && r2PolymerBond) ||
    isMonomerConnectedToR2RnaBase(nextMonomer)
  )
    return undefined;

  return r2PolymerBond &&
    nextMonomer?.getAttachmentPointByBond(r2PolymerBond) ===
      AttachmentPointName.R1
    ? nextMonomer
    : undefined;
}

export function getRnaBaseFromSugar(monomer?: BaseMonomer) {
  if (!monomer || !(monomer instanceof Sugar)) return undefined;
  const r3PolymerBond = monomer.attachmentPointsToBonds.R3;
  const r3ConnectedMonomer = r3PolymerBond?.getAnotherMonomer(monomer);

  if (!r3ConnectedMonomer) {
    return false;
  }

  const r1PolymerBondOfConnectedMonomer =
    r3ConnectedMonomer?.attachmentPointsToBonds.R1;
  const r1ConnectedMonomer =
    r1PolymerBondOfConnectedMonomer?.getAnotherMonomer(r3ConnectedMonomer);

  return r3ConnectedMonomer instanceof RNABase && r1ConnectedMonomer === monomer
    ? r3ConnectedMonomer
    : undefined;
}

export function getSugarFromRnaBase(monomer?: BaseMonomer) {
  if (!monomer || !(monomer instanceof RNABase)) return undefined;
  const r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  const r1ConnectedMonomer = r1PolymerBond?.getAnotherMonomer(monomer);

  if (!r1ConnectedMonomer) {
    return undefined;
  }

  const r3PolymerBondOfConnectedMonomer =
    r1ConnectedMonomer?.attachmentPointsToBonds.R3;
  const r3ConnectedMonomer =
    r3PolymerBondOfConnectedMonomer?.getAnotherMonomer(r1ConnectedMonomer);

  return r1ConnectedMonomer instanceof Sugar && r3ConnectedMonomer === monomer
    ? r1ConnectedMonomer
    : undefined;
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
  MonomerTypes: Array<
    typeof Peptide | typeof Phosphate | typeof Sugar | typeof UnsplitNucleotide
  >,
) {
  const r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  const previousMonomer = r1PolymerBond?.getAnotherMonomer(monomer);
  const isPreviousMonomerPartOfChain =
    previousMonomer &&
    !MonomerTypes.some((MonomerType) => previousMonomer instanceof MonomerType);
  const previousConnectionNotR2 =
    r1PolymerBond &&
    previousMonomer?.getAttachmentPointByBond(r1PolymerBond) !== 'R2';

  // For single monomers we check that monomer has bonds, but for UnsplitNucleotide we don't
  // to be consistent with rna triplets (we show enumeration for single triplet)
  return (
    ((monomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) ||
      !monomer.hasAttachmentPoint(AttachmentPointName.R1)) &&
      (monomer.hasBonds || monomer instanceof UnsplitNucleotide)) ||
    previousConnectionNotR2 ||
    isPreviousMonomerPartOfChain
  );
}

export function isValidNucleotide(
  sugar: Sugar,
  firstMonomerInCyclicChain?: BaseMonomer,
): boolean {
  if (!getRnaBaseFromSugar(sugar)) {
    return false;
  }

  const phosphate = getPhosphateFromSugar(sugar);
  if (!phosphate || phosphate === firstMonomerInCyclicChain) {
    return false;
  }

  const nextMonomerAfterPhosphate = getNextMonomerInChain(phosphate);
  return !!nextMonomerAfterPhosphate;
}

export function isValidNucleoside(
  sugar: Sugar,
  firstMonomerInCyclicChain?: BaseMonomer,
): boolean {
  if (!getRnaBaseFromSugar(sugar)) {
    return false;
  }

  const phosphate = getPhosphateFromSugar(sugar);
  if (!phosphate || phosphate === firstMonomerInCyclicChain) {
    return true;
  }

  const nextMonomerAfterPhosphate = getNextMonomerInChain(phosphate);
  return !nextMonomerAfterPhosphate;
}
