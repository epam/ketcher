import { AttachmentPointName } from 'domain/types';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';

type PolymerBondLike = {
  firstMonomer: BaseMonomer;
  secondMonomer?: BaseMonomer;
  firstMonomerAttachmentPoint?: AttachmentPointName;
  secondMonomerAttachmentPoint?: AttachmentPointName;
  getAnotherMonomer: (monomer: BaseMonomer) => BaseMonomer | undefined;
};

type MonomerLikeWithClass = {
  monomerItem?: { class?: string };
  monomerClass?: string;
};

const getMonomerClass = (monomer?: BaseMonomer) =>
  // BaseMonomer does not expose normalized class metadata on its TS contract,
  // so we read it from runtime monomer payload fields used across KET models.
  (monomer as MonomerLikeWithClass | undefined)?.monomerItem?.class ??
  (monomer as MonomerLikeWithClass | undefined)?.monomerClass;

const isPolymerBondLike = (bond: unknown): bond is PolymerBondLike =>
  Boolean(
    bond &&
      typeof bond === 'object' &&
      'getAnotherMonomer' in bond &&
      !(bond instanceof MonomerToAtomBond),
  );

const isRnaBaseOrAmbiguousRnaBase = (monomer?: BaseMonomer): boolean =>
  getMonomerClass(monomer) === 'Base';

const isSugarMonomer = (monomer?: BaseMonomer): boolean =>
  getMonomerClass(monomer) === 'Sugar';

const getSugarFromRnaBase = (
  monomer?: BaseMonomer,
): BaseMonomer | undefined => {
  if (!monomer || !isRnaBaseOrAmbiguousRnaBase(monomer)) {
    return undefined;
  }

  const r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  const r1ConnectedMonomer = isPolymerBondLike(r1PolymerBond)
    ? r1PolymerBond.getAnotherMonomer(monomer)
    : undefined;

  if (!r1ConnectedMonomer) {
    return undefined;
  }

  const r3PolymerBond = r1ConnectedMonomer.attachmentPointsToBonds.R3;
  const r3ConnectedMonomer = isPolymerBondLike(r3PolymerBond)
    ? r3PolymerBond.getAnotherMonomer(r1ConnectedMonomer)
    : undefined;

  return isSugarMonomer(r1ConnectedMonomer) && r3ConnectedMonomer === monomer
    ? r1ConnectedMonomer
    : undefined;
};

export const isMonomerConnectedToR2RnaBase = (
  monomer?: BaseMonomer,
): boolean => {
  if (!monomer) {
    return false;
  }

  const r1PolymerBond = monomer.attachmentPointsToBonds.R1;

  if (r1PolymerBond instanceof MonomerToAtomBond) {
    return false;
  }

  const r1ConnectedMonomer = r1PolymerBond?.getAnotherMonomer(monomer);
  if (!r1ConnectedMonomer) {
    return false;
  }
  const r2PolymerBond = r1ConnectedMonomer.attachmentPointsToBonds.R2;

  return Boolean(
    isRnaBaseOrAmbiguousRnaBase(r1ConnectedMonomer) &&
      getSugarFromRnaBase(r1ConnectedMonomer) &&
      isPolymerBondLike(r2PolymerBond) &&
      r2PolymerBond.getAnotherMonomer(r1ConnectedMonomer) === monomer,
  );
};

export const isBondBetweenSugarAndBaseOfRna = (
  polymerBond: PolymerBondLike,
): boolean =>
  (polymerBond.firstMonomerAttachmentPoint === AttachmentPointName.R1 &&
    isRnaBaseOrAmbiguousRnaBase(polymerBond.firstMonomer) &&
    polymerBond.secondMonomerAttachmentPoint === AttachmentPointName.R3 &&
    isSugarMonomer(polymerBond.secondMonomer)) ||
  (polymerBond.firstMonomerAttachmentPoint === AttachmentPointName.R3 &&
    isSugarMonomer(polymerBond.firstMonomer) &&
    polymerBond.secondMonomerAttachmentPoint === AttachmentPointName.R1 &&
    isRnaBaseOrAmbiguousRnaBase(polymerBond.secondMonomer));

export { isRnaBaseOrAmbiguousRnaBase };
