import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import type { Peptide } from 'domain/entities/Peptide';
import type { RNABase } from 'domain/entities/RNABase';
import type { Sugar } from 'domain/entities/Sugar';
import {
  AttachmentPointName,
  MonomerItemType,
  MonomerOrAmbiguousType,
  AmbiguousMonomerType,
} from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { IVariantMonomer } from 'domain/entities/types';
import {
  KetMonomerClass,
  KetMonomerTemplateAtom,
} from 'application/formatters/types/ket';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { IRnaPreset } from 'application/editor';

/**
 * Structural equivalent of AmbiguousMonomer used locally to avoid importing the class
 * and creating extra dependency edges in core entity/helper graph.
 */
type AmbiguousMonomerEntity = BaseMonomer &
  IVariantMonomer & {
    isAmbiguous: true;
    monomerClass: KetMonomerClass;
  };

type AmbiguousMonomerLike = {
  isAmbiguous?: boolean;
  monomerClass?: KetMonomerClass;
};

/**
 * Runtime guard for ambiguous monomers without importing the AmbiguousMonomer class,
 * to avoid introducing an additional dependency edge into the entity graph.
 */
const isAmbiguousMonomerEntity = (
  monomer?: BaseMonomer,
): monomer is AmbiguousMonomerEntity => {
  const ambiguousMonomer = monomer as AmbiguousMonomerLike | undefined;

  return Boolean(
    ambiguousMonomer?.isAmbiguous && ambiguousMonomer?.monomerClass,
  );
};

const getMonomerClass = (
  monomer?: BaseMonomer,
): KetMonomerClass | string | undefined => {
  const monomerLike = monomer as
    | {
        monomerItem?: { class?: KetMonomerClass | string };
        monomerClass?: KetMonomerClass | string;
      }
    | undefined;

  return monomerLike?.monomerItem?.class ?? monomerLike?.monomerClass;
};

const isMonomerOfClass = (
  monomer: BaseMonomer | undefined,
  monomerClass: KetMonomerClass,
): boolean => getMonomerClass(monomer) === monomerClass;

/**
 * Maps ambiguous monomer class metadata to chain constructor types used in chain checks.
 * This keeps runtime checks independent from the AmbiguousMonomer class constructor.
 */
type ChainMonomerType = 'Peptide' | 'Phosphate' | 'Sugar' | 'UnsplitNucleotide';
const CHAIN_MONOMER_TYPE_TO_CLASS: Record<ChainMonomerType, KetMonomerClass> = {
  Peptide: KetMonomerClass.AminoAcid,
  Phosphate: KetMonomerClass.Phosphate,
  Sugar: KetMonomerClass.Sugar,
  UnsplitNucleotide: KetMonomerClass.RNA,
};

const isMonomerClassCompatible = (
  monomer: AmbiguousMonomerEntity,
  monomerType: ChainMonomerType,
): boolean => {
  switch (monomerType) {
    case 'Peptide':
      return monomer.monomerClass === KetMonomerClass.AminoAcid;
    case 'Phosphate':
      return monomer.monomerClass === KetMonomerClass.Phosphate;
    case 'Sugar':
      return monomer.monomerClass === KetMonomerClass.Sugar;
    case 'UnsplitNucleotide':
      return monomer.monomerClass === KetMonomerClass.RNA;
    default:
      return false;
  }
};

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
  if (!monomer || !isMonomerOfClass(monomer, KetMonomerClass.Sugar))
    return undefined;
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

  return isMonomerOfClass(r1ConnectedMonomer, KetMonomerClass.Sugar) &&
    r3ConnectedMonomer === monomer
    ? r1ConnectedMonomer
    : undefined;
}

export function isBondBetweenSugarAndBaseOfRna(polymerBond: PolymerBond) {
  return (
    (polymerBond.firstMonomerAttachmentPoint === AttachmentPointName.R1 &&
      isRnaBaseOrAmbiguousRnaBase(polymerBond.firstMonomer) &&
      polymerBond.secondMonomerAttachmentPoint === AttachmentPointName.R3 &&
      isMonomerOfClass(polymerBond.secondMonomer, KetMonomerClass.Sugar)) ||
    (polymerBond.firstMonomerAttachmentPoint === AttachmentPointName.R3 &&
      isMonomerOfClass(polymerBond.firstMonomer, KetMonomerClass.Sugar) &&
      polymerBond.secondMonomerAttachmentPoint === AttachmentPointName.R1 &&
      isRnaBaseOrAmbiguousRnaBase(polymerBond.secondMonomer))
  );
}

export function getPhosphateFromSugar(monomer?: BaseMonomer) {
  if (!monomer) return undefined;
  const nextMonomerInChain = getNextMonomerInChain(monomer);

  return isMonomerOfClass(nextMonomerInChain, KetMonomerClass.Phosphate)
    ? nextMonomerInChain
    : undefined;
}

export function isMonomerBeginningOfChain(
  monomer: BaseMonomer,
  MonomerTypes: Array<ChainMonomerType>,
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
        isMonomerOfClass(
          previousMonomer,
          CHAIN_MONOMER_TYPE_TO_CLASS[MonomerType],
        ) ||
        (isAmbiguousMonomerEntity(previousMonomer) &&
          isMonomerClassCompatible(previousMonomer, MonomerType)),
    );
  const previousConnectionNotR2 =
    r1PolymerBond &&
    previousMonomer?.getAttachmentPointByBond(r1PolymerBond) !== 'R2';

  // For single monomers we check that monomer has bonds, but for UnsplitNucleotide we don't
  // to be consistent with rna triplets (we show enumeration for single triplet)
  return (
    ((monomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) ||
      !monomer.hasAttachmentPoint(AttachmentPointName.R1)) &&
      (monomer.hasBonds || isMonomerOfClass(monomer, KetMonomerClass.RNA))) ||
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

export const isLibraryItemRnaPreset = (
  item: IRnaPreset | MonomerOrAmbiguousType,
): item is IRnaPreset => {
  return 'sugar' in item;
};

export const libraryItemHasR1AttachmentPoint = (
  libraryItem: MonomerOrAmbiguousType | IRnaPreset,
  attachmentPointName: AttachmentPointName = AttachmentPointName.R1,
) => {
  // Rely on MonomerCaps field is not the best approach,
  // but for indeterminate library items it is universal and easy.
  if (isLibraryItemRnaPreset(libraryItem)) {
    return Boolean(
      libraryItem.sugar?.props?.MonomerCaps?.[attachmentPointName],
    );
  } else if (isAmbiguousMonomerLibraryItem(libraryItem)) {
    return libraryItem.monomers.every((monomer) =>
      monomer.isAttachmentPointExistAndFree(
        AttachmentPointName[attachmentPointName],
      ),
    );
  } else {
    return libraryItem.props.MonomerCaps?.[attachmentPointName];
  }
};

export function isPeptideOrAmbiguousPeptide(
  monomer?: BaseMonomer,
): monomer is Peptide | AmbiguousMonomerEntity {
  return (
    isMonomerOfClass(monomer, KetMonomerClass.AminoAcid) ||
    (isAmbiguousMonomerEntity(monomer) &&
      monomer.monomerClass === KetMonomerClass.AminoAcid)
  );
}

export function isRnaBaseOrAmbiguousRnaBase(
  monomer?: BaseMonomer,
): monomer is RNABase | AmbiguousMonomerEntity {
  return (
    isMonomerOfClass(monomer, KetMonomerClass.Base) ||
    (isAmbiguousMonomerEntity(monomer) &&
      monomer.monomerClass === KetMonomerClass.Base)
  );
}

export function isRnaBaseApplicableForAntisense(monomer?: BaseMonomer) {
  return (
    isMonomerOfClass(monomer, KetMonomerClass.RNA) ||
    (isRnaBaseOrAmbiguousRnaBase(monomer) &&
      Boolean(getSugarFromRnaBase(monomer)))
  );
}

export function getAllConnectedMonomersRecursively(
  monomer: BaseMonomer,
): BaseMonomer[] {
  const stack = [monomer];
  const visited = new Set<BaseMonomer>();
  const connectedMonomers: BaseMonomer[] = [];

  while (stack.length > 0) {
    const currentMonomer = stack.pop();

    if (!currentMonomer || visited.has(currentMonomer)) {
      continue;
    }

    visited.add(currentMonomer);
    connectedMonomers.push(currentMonomer);

    currentMonomer.forEachBond((bond) => {
      if (bond instanceof PolymerBond || bond instanceof HydrogenBond) {
        const anotherMonomer = bond.getAnotherMonomer(currentMonomer);
        if (anotherMonomer && !visited.has(anotherMonomer)) {
          stack.push(anotherMonomer);
        }
      }
    });
  }

  return connectedMonomers;
}

export const canModifyAminoAcid = (
  monomer: BaseMonomer,
  modificationMonomerLibraryItem: MonomerItemType,
) => {
  return (
    (monomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) ||
      modificationMonomerLibraryItem.props.MonomerCaps?.R1) &&
    (monomer.isAttachmentPointExistAndFree(AttachmentPointName.R2) ||
      modificationMonomerLibraryItem.props.MonomerCaps?.R2)
  );
};

export const getAminoAcidsToModify = (
  monomers: BaseMonomer[],
  modificationType: string,
  monomersLibrary: MonomerItemType[],
) => {
  const naturalAnalogueToModifiedMonomerItem = new Map<
    string,
    MonomerItemType
  >();
  const aminoAcidsToModify = new Map<BaseMonomer, MonomerItemType>();

  monomersLibrary.forEach((libraryItem) => {
    if (!libraryItem.props?.modificationTypes?.includes(modificationType)) {
      return;
    }
    const monomerNaturalAnalogCode = libraryItem.props.MonomerNaturalAnalogCode;

    if (monomerNaturalAnalogCode) {
      naturalAnalogueToModifiedMonomerItem.set(
        monomerNaturalAnalogCode,
        libraryItem,
      );
    }
  });

  monomers.forEach((monomer) => {
    const monomerNaturalAnalogCode =
      monomer.monomerItem.props.MonomerNaturalAnalogCode;
    const modifiedMonomerItem = naturalAnalogueToModifiedMonomerItem.get(
      monomerNaturalAnalogCode,
    );

    if (
      modifiedMonomerItem &&
      monomer.label !== modifiedMonomerItem.label &&
      canModifyAminoAcid(monomer, modifiedMonomerItem)
    ) {
      aminoAcidsToModify.set(monomer, modifiedMonomerItem);
    }
  });

  return aminoAcidsToModify;
};

export const isHelmCompatible = (
  monomers: BaseMonomer[],
  monomersLibrary: MonomerItemType[],
) => {
  return monomers
    .map((monomer) =>
      monomersLibrary.find((libraryMonomer) =>
        isAmbiguousMonomerLibraryItem(libraryMonomer)
          ? libraryMonomer.id === monomer.monomerItem.props.id
          : libraryMonomer.props?.id === monomer.monomerItem.props.id,
      ),
    )
    .every((monomer) => Boolean(monomer?.props.aliasHELM));
};

export const normalizeMonomerAtomsPositions = (
  atoms: KetMonomerTemplateAtom[],
) => {
  const bbox = {
    x: 99999,
    y: -99999,
    x2: -9999,
    y2: 9999,
  };

  atoms.forEach((atom) => {
    if (atom.location[0] < bbox.x) {
      bbox.x = atom.location[0];
    }
    if (atom.location[0] > bbox.x2) {
      bbox.x2 = atom.location[0];
    }
    if (atom.location[1] > bbox.y) {
      bbox.y = atom.location[1];
    }
    if (atom.location[1] < bbox.y2) {
      bbox.y2 = atom.location[1];
    }
  });

  const center = {
    x: (bbox.x2 - bbox.x) / 2,
    y: (bbox.y2 - bbox.y) / 2,
  };

  return atoms.map((atom) => ({
    ...atom,
    location: [
      Number((atom.location[0] - bbox.x - center.x).toFixed(3)),
      Number((atom.location[1] - bbox.y - center.y).toFixed(3)),
      atom.location[2],
    ] as [number, number, number],
  }));
};
