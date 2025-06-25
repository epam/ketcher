import {
  KetAmbiguousMonomerTemplateSubType,
  KetMonomerClass,
} from 'application/formatters';

import { Vec2 } from 'domain/entities/vec2';
import {
  AttachmentPointName,
  AttachmentPointsToBonds,
  MonomerItemType,
} from 'domain/types';
import { HydrogenBond } from './HydrogenBond';

import { RnaSubChain } from './monomer-chains/RnaSubChain';
import { ChemSubChain } from './monomer-chains/ChemSubChain';
import { PhosphateSubChain } from './monomer-chains/PhosphateSubChain';
import { PeptideSubChain } from './monomer-chains/PeptideSubChain';
import { PolymerBond } from './PolymerBond';
import { MonomerToAtomBond } from './MonomerToAtomBond';
import { DrawingEntity } from './DrawingEntity';

export enum AtomCIP {
  S = 'S',
  R = 'R',
  s = 's',
  r = 'r',
}

export enum BondCIP {
  E = 'E',
  Z = 'Z',
  M = 'M',
  P = 'P',
}

export interface IBaseMonomer extends DrawingEntity {
  renderer?: unknown;
  attachmentPointsToBonds: AttachmentPointsToBonds;
  chosenFirstAttachmentPointForBond: AttachmentPointName | null;
  potentialSecondAttachmentPointForBond: AttachmentPointName | null;
  chosenSecondAttachmentPointForBond: AttachmentPointName | null;
  potentialAttachmentPointsToBonds: AttachmentPointsToBonds;
  attachmentPointsVisible: boolean;
  monomerItem: MonomerItemType;
  isMonomerInRnaChainRow: boolean;
  hydrogenBonds: HydrogenBond[];

  label: string;
  center: Vec2;
  listOfAttachmentPoints: AttachmentPointName[];
  firstFreeAttachmentPoint: AttachmentPointName | undefined;
  R1AttachmentPoint: AttachmentPointName | undefined;
  R2AttachmentPoint: AttachmentPointName | undefined;
  hasFreeAttachmentPoint: boolean;
  covalentBonds: Array<PolymerBond | MonomerToAtomBond>;
  polymerBonds: PolymerBond[];
  bonds: Array<PolymerBond | HydrogenBond | MonomerToAtomBond>;
  bondsSortedByLength: Array<PolymerBond | HydrogenBond | MonomerToAtomBond>;
  polymerBondsSortedByLength: Array<PolymerBond | HydrogenBond>;
  hasBonds: boolean;
  hasPotentialBonds(): boolean;
  monomerCaps: unknown;
  sideConnections: Array<PolymerBond | HydrogenBond>;

  getValidSourcePoint(monomer?: IBaseMonomer): AttachmentPointName | undefined;
  getValidTargetPoint(monomer: IBaseMonomer): string | undefined;
  getPotentialAttachmentPointByBond(
    bond: PolymerBond,
  ): AttachmentPointName | undefined;
  getPotentialBond(attachmentPointName: string): PolymerBond | null | undefined;
  getBondByAttachmentPoint(
    attachmentPointName: AttachmentPointName,
  ): PolymerBond | MonomerToAtomBond | null | undefined;
  isAttachmentPointExistAndFree(attachmentPoint: AttachmentPointName): boolean;
  isAttachmentPointUsed(attachmentPointName: AttachmentPointName): boolean;
  isAttachmentPointPotentiallyUsed(
    attachmentPointName: AttachmentPointName,
  ): boolean;
  removeBond(polymerBond: PolymerBond): void;
  removePotentialBonds(clearSelectedPoints?: boolean): void;
  recalculateAttachmentPoints(): void;
  turnOnAttachmentPointsVisibility(): void;
  turnOffAttachmentPointsVisibility(): void;
  setChosenFirstAttachmentPoint(
    attachmentPoint: AttachmentPointName | null,
  ): void;
  setChosenSecondAttachmentPoint(
    attachmentPoint: AttachmentPointName | null,
  ): void;
  setPotentialSecondAttachmentPoint(
    attachmentPoint: AttachmentPointName | null,
  ): void;
  setPotentialBond(
    attachmentPoint: string | undefined,
    potentialBond?: PolymerBond | HydrogenBond | null,
  ): void;
  setBond(
    attachmentPointName: AttachmentPointName,
    bond: PolymerBond | HydrogenBond,
  ): void;
  unsetBond(
    attachmentPointName?: AttachmentPointName,
    bondToDelete?: HydrogenBond | PolymerBond,
  ): void;
  forEachBond(
    callback: (
      polymerBond: PolymerBond | MonomerToAtomBond | HydrogenBond,
      attachmentPointName: AttachmentPointName,
    ) => void,
  ): void;
  isMonomerTypeDifferentForChaining(monomerToChain: IBaseMonomer): boolean;
  SubChainConstructor:
    | typeof RnaSubChain
    | typeof ChemSubChain
    | typeof PhosphateSubChain
    | typeof PeptideSubChain;

  getAttachmentPointByBond(
    bond: PolymerBond | MonomerToAtomBond | HydrogenBond,
  ): AttachmentPointName | undefined;
}

export interface IVariantMonomer {
  monomers: IBaseMonomer[];
  monomerClass: KetMonomerClass;
  subtype: KetAmbiguousMonomerTemplateSubType;
}
