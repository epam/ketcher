import {
  AmbiguousMonomer,
  BaseMonomer,
  Peptide,
  Phosphate,
  RNABase,
  Sugar,
  UnsplitNucleotide,
} from 'domain/entities';
import {
  AttachmentPointName,
  MonomerItemType,
  MonomerOrAmbiguousType,
  AmbiguousMonomerType,
} from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { IVariantMonomer } from 'domain/entities/types';
import { KetMonomerClass } from 'application/formatters';
import { MONOMER_CLASS_TO_CONSTRUCTOR } from 'domain/constants/monomers';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';

export function getMonomerUniqueKey(monomer: MonomerItemType) {
  return `${monomer.props.MonomerName}___${monomer.props.Name}`;
}

export function checkIsR2R1Connection(
  monomer: BaseMonomer,
  nextMonomer: BaseMonomer,
) {
  const r1PolymerBond = nextMonomer.attachmentPointsToBonds.R1;

  return (
    r1PolymerBond instanceof PolymerBond &&
    r1PolymerBond?.getAnotherMonomer(nextMonomer) === monomer
  );
}

export function isR2R1ConnectionFromRnaBase(polymerBond: PolymerBond) {
  const firstMonomerAttachmentPoint =
    polymerBond.firstMonomer.getAttachmentPointByBond(polymerBond);
  const secondMonomerAttachmentPoint =
    polymerBond.secondMonomer?.getAttachmentPointByBond(polymerBond);

  return (
    (isRnaBaseOrAmbiguousRnaBase(polymerBond.firstMonomer) &&
      firstMonomerAttachmentPoint === AttachmentPointName.R2 &&
      secondMonomerAttachmentPoint === AttachmentPointName.R1) ||
    (isRnaBaseOrAmbiguousRnaBase(polymerBond.secondMonomer) &&
      secondMonomerAttachmentPoint === AttachmentPointName.R2 &&
      firstMonomerAttachmentPoint === AttachmentPointName.R1)
  );
}

export function isMonomerConnectedToR2RnaBase(monomer?: BaseMonomer) {
  if (!monomer) {
    return false;
  }

  const R1PolymerBond = monomer.attachmentPointsToBonds.R1;

  if (R1PolymerBond instanceof MonomerToAtomBond) {
    return false;
  }

  const R1ConnectedMonomer = R1PolymerBond?.getAnotherMonomer(monomer);
  const r2PolymerBond = R1ConnectedMonomer?.attachmentPointsToBonds.R2;

  return (
    isRnaBaseOrAmbiguousRnaBase(R1ConnectedMonomer) &&
    getSugarFromRnaBase(R1ConnectedMonomer) &&
    r2PolymerBond instanceof PolymerBond &&
    r2PolymerBond?.getAnotherMonomer(R1ConnectedMonomer) === monomer
  );
}

export function getPreviousMonomerInChain(monomer: BaseMonomer) {
  const r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  const previousMonomer =
    r1PolymerBond instanceof PolymerBond
      ? r1PolymerBond?.getAnotherMonomer(monomer)
      : undefined;

  if (!previousMonomer || !(r1PolymerBond instanceof PolymerBond)) {
    return undefined;
  }

  return previousMonomer &&
    previousMonomer.getAttachmentPointByBond(r1PolymerBond) ===
      AttachmentPointName.R2
    ? previousMonomer
    : undefined;
}

export function getNextMonomerInChain(
  monomer?: BaseMonomer,
  firstMonomer?: BaseMonomer | null,
) {
  if (!monomer) return undefined;

  const r2PolymerBond = monomer.attachmentPointsToBonds.R2;
  const nextMonomer =
    r2PolymerBond instanceof PolymerBond
      ? r2PolymerBond?.getAnotherMonomer?.(monomer)
      : undefined;

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
  const r3ConnectedMonomer =
    r3PolymerBond instanceof PolymerBond
      ? r3PolymerBond?.getAnotherMonomer(monomer)
      : undefined;

  if (!r3ConnectedMonomer) {
    return undefined;
  }

  const r1PolymerBondOfConnectedMonomer =
    r3ConnectedMonomer?.attachmentPointsToBonds.R1;
  const r1ConnectedMonomer =
    r1PolymerBondOfConnectedMonomer instanceof PolymerBond
      ? r1PolymerBondOfConnectedMonomer?.getAnotherMonomer(r3ConnectedMonomer)
      : undefined;

  return isRnaBaseOrAmbiguousRnaBase(r3ConnectedMonomer) &&
    r1ConnectedMonomer === monomer
    ? r3ConnectedMonomer
    : undefined;
}

export function getSugarFromRnaBase(monomer?: BaseMonomer) {
  if (!monomer || !isRnaBaseOrAmbiguousRnaBase(monomer)) return undefined;
  const r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  const r1ConnectedMonomer =
    r1PolymerBond instanceof PolymerBond
      ? r1PolymerBond?.getAnotherMonomer(monomer)
      : undefined;

  if (!r1ConnectedMonomer) {
    return undefined;
  }

  const r3PolymerBondOfConnectedMonomer =
    r1ConnectedMonomer?.attachmentPointsToBonds.R3;
  const r3ConnectedMonomer =
    r3PolymerBondOfConnectedMonomer instanceof PolymerBond
      ? r3PolymerBondOfConnectedMonomer?.getAnotherMonomer(r1ConnectedMonomer)
      : undefined;

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

  if (r1PolymerBond instanceof MonomerToAtomBond) {
    return true;
  }

  const previousMonomer = r1PolymerBond?.getAnotherMonomer(monomer);
  const isPreviousMonomerPartOfChain =
    previousMonomer &&
    !MonomerTypes.some(
      (MonomerType) =>
        previousMonomer instanceof MonomerType ||
        (previousMonomer instanceof AmbiguousMonomer &&
          MONOMER_CLASS_TO_CONSTRUCTOR[previousMonomer.monomerClass] ===
            MonomerType),
    );
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

export const isRnaBaseVariantMonomer = (
  monomer: BaseMonomer & IVariantMonomer,
) => monomer.monomerClass === KetMonomerClass.Base;

export function isAmbiguousMonomerLibraryItem(
  monomer?: MonomerOrAmbiguousType,
): monomer is AmbiguousMonomerType {
  return Boolean(monomer && monomer.isAmbiguous);
}

export function isPeptideOrAmbiguousPeptide(
  monomer?: BaseMonomer,
): monomer is Peptide | AmbiguousMonomer {
  return (
    monomer instanceof Peptide ||
    (monomer instanceof AmbiguousMonomer &&
      monomer.monomerClass === KetMonomerClass.AminoAcid)
  );
}

export function isRnaBaseOrAmbiguousRnaBase(
  monomer?: BaseMonomer,
): monomer is RNABase | AmbiguousMonomer {
  return (
    monomer instanceof RNABase ||
    (monomer instanceof AmbiguousMonomer &&
      monomer.monomerClass === KetMonomerClass.Base)
  );
}
