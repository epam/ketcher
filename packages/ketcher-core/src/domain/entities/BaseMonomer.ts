import { DrawingEntity, DrawingEntityConfig } from './DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import {
  AttachmentPointName,
  AttachmentPointsToBonds,
  MonomerItemType,
  MonomerBond,
} from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { getAttachmentPointLabel } from 'domain/helpers/attachmentPointCalculations';
import assert from 'assert';
import {
  IKetAttachmentPoint,
  IKetAttachmentPointType,
  KetMonomerClass,
} from 'application/formatters/types/ket';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';
import { PeptideSubChain } from 'domain/entities/monomer-chains/PeptideSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { PhosphateSubChain } from 'domain/entities/monomer-chains/PhosphateSubChain';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { compact, isNumber, values } from 'lodash';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { HydrogenBond } from 'domain/entities/HydrogenBond';

export type BaseMonomerConfig = DrawingEntityConfig;
export const HYDROGEN_BOND_ATTACHMENT_POINT = 'hydrogen';

export abstract class BaseMonomer extends DrawingEntity {
  public renderer?: BaseMonomerRenderer | BaseSequenceItemRenderer = undefined;
  public attachmentPointsToBonds: AttachmentPointsToBonds = {};

  public chosenFirstAttachmentPointForBond: AttachmentPointName | null;
  public potentialSecondAttachmentPointForBond: AttachmentPointName | null;
  public chosenSecondAttachmentPointForBond: AttachmentPointName | null;

  public potentialAttachmentPointsToBonds: AttachmentPointsToBonds = {};

  public attachmentPointsVisible = false;
  public monomerItem: MonomerItemType;
  public hydrogenBonds: HydrogenBond[] = [];

  constructor(
    monomerItem: MonomerItemType,
    _position?: Vec2,
    config?: BaseMonomerConfig,
  ) {
    super(_position, config);

    this.monomerItem = { ...monomerItem };
    this.monomerItem.expanded = monomerItem.expanded;
    this.recalculateAttachmentPoints();
    this.monomerItem.attachmentPoints =
      this.monomerItem.attachmentPoints ??
      this.getMonomerDefinitionAttachmentPoints();
    this.chosenFirstAttachmentPointForBond = null;
    this.potentialSecondAttachmentPointForBond = null;
    this.chosenSecondAttachmentPointForBond = null;
  }

  public get label() {
    return this.monomerItem.label;
  }

  public get center() {
    return this.position;
  }

  public get listOfAttachmentPoints() {
    const maxAttachmentPointNumber = this.getMaxAttachmentPointNumber();
    const attachmentPointList: AttachmentPointName[] = [];
    for (let i = 1; i <= maxAttachmentPointNumber; i++) {
      const attachmentPointLabel = getAttachmentPointLabel(i);

      if (this.attachmentPointsToBonds[attachmentPointLabel] !== undefined) {
        attachmentPointList.push(attachmentPointLabel);
      }
    }
    return attachmentPointList;
  }

  public turnOnAttachmentPointsVisibility() {
    this.attachmentPointsVisible = true;
  }

  public turnOffAttachmentPointsVisibility() {
    this.attachmentPointsVisible = false;
  }

  public setChosenFirstAttachmentPoint(
    attachmentPoint: AttachmentPointName | null,
  ) {
    this.chosenFirstAttachmentPointForBond = attachmentPoint;
  }

  public setChosenSecondAttachmentPoint(
    attachmentPoint: AttachmentPointName | null,
  ) {
    this.chosenSecondAttachmentPointForBond = attachmentPoint;
  }

  public setPotentialSecondAttachmentPoint(
    attachmentPoint: AttachmentPointName | null,
  ) {
    this.potentialSecondAttachmentPointForBond = attachmentPoint;
  }

  public setPotentialBond(
    attachmentPoint: string | undefined,
    potentialBond?: PolymerBond | HydrogenBond | null,
  ) {
    if (potentialBond instanceof HydrogenBond) {
      this.hydrogenBonds.push(potentialBond);

      return;
    }

    if (attachmentPoint !== undefined) {
      this.potentialAttachmentPointsToBonds[attachmentPoint] = potentialBond;
    }
  }

  public getAttachmentPointByBond(
    bond: MonomerBond,
  ): AttachmentPointName | undefined {
    if (bond instanceof HydrogenBond) {
      return this.hydrogenBonds.find((hydrogenBond) => hydrogenBond === bond)
        ? AttachmentPointName.HYDROGEN
        : undefined;
    }

    for (const attachmentPointName in this.attachmentPointsToBonds) {
      if (this.attachmentPointsToBonds[attachmentPointName] === bond) {
        return attachmentPointName as AttachmentPointName;
      }
    }

    return undefined;
  }

  public abstract getValidSourcePoint(
    monomer?: BaseMonomer,
  ): AttachmentPointName | undefined;

  public abstract getValidTargetPoint(monomer: BaseMonomer): string | undefined;

  public getPotentialAttachmentPointByBond(bond: PolymerBond) {
    for (const attachmentPointName in this.potentialAttachmentPointsToBonds) {
      if (this.potentialAttachmentPointsToBonds[attachmentPointName] === bond) {
        return attachmentPointName as AttachmentPointName;
      }
    }

    return undefined;
  }

  public get firstFreeAttachmentPoint() {
    const maxAttachmentPointNumber = this.getMaxAttachmentPointNumber();
    for (let i = 1; i <= maxAttachmentPointNumber; i++) {
      const attachmentPoint = `R${i}` as AttachmentPointName;
      if (
        this.hasAttachmentPoint(attachmentPoint) &&
        this.attachmentPointsToBonds[attachmentPoint] === null
      ) {
        return attachmentPoint;
      }
    }

    return undefined;
  }

  private getMaxAttachmentPointNumber() {
    let maxAttachmentPointNumber = 1;
    for (const attachmentPoint in this.attachmentPointsToBonds) {
      const match = /R(\d+)/.exec(attachmentPoint);
      if (match) {
        const pointNumber = parseInt(match[1]);
        if (!isNaN(pointNumber) && pointNumber > maxAttachmentPointNumber) {
          maxAttachmentPointNumber = pointNumber;
        }
      }
    }
    return maxAttachmentPointNumber;
  }

  public get R1AttachmentPoint(): AttachmentPointName | undefined {
    if (this.attachmentPointsToBonds.R1 === null) {
      return AttachmentPointName.R1;
    }

    return undefined;
  }

  public get R2AttachmentPoint(): AttachmentPointName | undefined {
    if (this.attachmentPointsToBonds.R2 === null) {
      return AttachmentPointName.R2;
    }

    return undefined;
  }

  public get hasFreeAttachmentPoint() {
    return Boolean(this.firstFreeAttachmentPoint);
  }

  public isAttachmentPointExistAndFree(attachmentPoint: AttachmentPointName) {
    return (
      this.hasAttachmentPoint(attachmentPoint) &&
      !this.isAttachmentPointUsed(attachmentPoint)
    );
  }

  public setRenderer(renderer: BaseMonomerRenderer | BaseSequenceItemRenderer) {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  public forEachBond(
    callback: (
      polymerBond: MonomerBond,
      attachmentPointName: AttachmentPointName,
    ) => void,
  ) {
    for (const attachmentPointName in this.attachmentPointsToBonds) {
      if (this.attachmentPointsToBonds[attachmentPointName]) {
        callback(
          this.attachmentPointsToBonds[attachmentPointName],
          attachmentPointName as AttachmentPointName,
        );
      }
    }

    this.hydrogenBonds.forEach((hydrogenBond) => {
      callback(hydrogenBond, AttachmentPointName.HYDROGEN);
    });
  }

  public setBond(attachmentPointName: AttachmentPointName, bond: MonomerBond) {
    if (!(bond instanceof HydrogenBond)) {
      this.attachmentPointsToBonds[attachmentPointName] = bond;

      return;
    }

    if (!this.hydrogenBonds.includes(bond)) {
      this.hydrogenBonds.push(bond);
    }
  }

  public unsetBond(
    attachmentPointName?: AttachmentPointName,
    bondToDelete?: HydrogenBond | PolymerBond,
  ) {
    if (bondToDelete instanceof HydrogenBond) {
      this.hydrogenBonds = this.hydrogenBonds.filter(
        (bond) => bond !== bondToDelete,
      );

      return;
    }

    if (attachmentPointName) {
      this.attachmentPointsToBonds[attachmentPointName] = null;
    }
  }

  public get covalentBonds() {
    return compact(values(this.attachmentPointsToBonds));
  }

  public get polymerBonds() {
    return this.covalentBonds.filter(
      (bond) => bond instanceof PolymerBond,
    ) as PolymerBond[];
  }

  public get monomerToAtomBonds() {
    return this.bonds.filter(
      (bond) => bond instanceof MonomerToAtomBond,
    ) as MonomerToAtomBond[];
  }

  public get bonds(): Array<PolymerBond | HydrogenBond | MonomerToAtomBond> {
    return [...this.covalentBonds, ...this.hydrogenBonds];
  }

  public get bondsSortedByLength(): Array<
    PolymerBond | HydrogenBond | MonomerToAtomBond
  > {
    const bonds = [...this.bonds];
    return bonds.sort((firstBond, secondBond) => {
      if (!firstBond.secondEndEntity || !secondBond.secondEndEntity) {
        return 0;
      }

      const firstLength = Vec2.diff(
        firstBond.firstEndEntity.position,
        firstBond.secondEndEntity?.position,
      ).length();
      const secondLength = Vec2.diff(
        secondBond.firstEndEntity.position,
        secondBond.secondEndEntity?.position,
      ).length();

      return firstLength - secondLength;
    });
  }

  public get polymerBondsSortedByLength(): Array<PolymerBond | HydrogenBond> {
    return this.bondsSortedByLength.filter(
      (bond) => !(bond instanceof MonomerToAtomBond),
    ) as Array<PolymerBond | HydrogenBond>;
  }

  public get hasBonds() {
    let hasBonds = false;
    for (const bondName in this.attachmentPointsToBonds) {
      if (this.attachmentPointsToBonds[bondName]) {
        hasBonds = true;
      }
    }

    return hasBonds || this.hydrogenBonds.length > 0;
  }

  public hasHydrogenBondWithMonomer(monomer: BaseMonomer) {
    return this.hydrogenBonds.find(
      (bond) => bond.firstMonomer === monomer || bond.secondMonomer === monomer,
    );
  }

  public hasPotentialBonds() {
    return Object.values(this.potentialAttachmentPointsToBonds).some(
      (bond) => !!bond,
    );
  }

  public getPotentialBond(attachmentPointName: string) {
    return this.potentialAttachmentPointsToBonds[attachmentPointName];
  }

  public removeBond(polymerBond: PolymerBond) {
    const attachmentPointName = this.getAttachmentPointByBond(polymerBond);
    if (!attachmentPointName) return;
    this.unsetBond(attachmentPointName);
  }

  public removePotentialBonds(clearSelectedPoints = false) {
    if (clearSelectedPoints) {
      this.chosenFirstAttachmentPointForBond = null;
      this.chosenSecondAttachmentPointForBond = null;
      this.potentialSecondAttachmentPointForBond = null;
    }

    for (const attachmentPointName in this.potentialAttachmentPointsToBonds) {
      this.potentialAttachmentPointsToBonds[attachmentPointName] = null;
    }
  }

  public get availableAttachmentPointForBondEnd() {
    if (this.chosenSecondAttachmentPointForBond) {
      return this.chosenSecondAttachmentPointForBond;
    }
    return this.firstFreeAttachmentPoint;
  }

  public hasAttachmentPoint(attachmentPointName: AttachmentPointName) {
    return this.attachmentPointsToBonds[attachmentPointName] !== undefined;
  }

  public get isPhosphate() {
    return this.monomerItem?.props?.MonomerClass === KetMonomerClass.Phosphate;
  }

  public get usedAttachmentPointsNamesList() {
    const list: AttachmentPointName[] = [];

    this.listOfAttachmentPoints.forEach((attachmentPointName) => {
      if (this.isAttachmentPointUsed(attachmentPointName)) {
        list.push(attachmentPointName);
      }
    });

    return list;
  }

  public get unUsedAttachmentPointsNamesList() {
    const list: AttachmentPointName[] = [];

    this.listOfAttachmentPoints.forEach((attachmentPointName) => {
      if (!this.isAttachmentPointUsed(attachmentPointName)) {
        list.push(attachmentPointName);
      }
    });

    return list;
  }

  public getBondByAttachmentPoint(attachmentPointName: AttachmentPointName) {
    return this.attachmentPointsToBonds[attachmentPointName];
  }

  public getPotentialBondByAttachmentPoint(
    attachmentPointName: AttachmentPointName,
  ) {
    return this.potentialAttachmentPointsToBonds[attachmentPointName];
  }

  public isAttachmentPointUsed(attachmentPointName: AttachmentPointName) {
    return Boolean(this.getBondByAttachmentPoint(attachmentPointName));
  }

  public isAttachmentPointPotentiallyUsed(
    attachmentPointName: AttachmentPointName,
  ) {
    return Boolean(this.getPotentialBondByAttachmentPoint(attachmentPointName));
  }

  private getAttachmentPointDict(): AttachmentPointsToBonds {
    if (this.monomerItem.attachmentPoints) {
      const { attachmentPointDictionary } =
        BaseMonomer.getAttachmentPointDictFromMonomerDefinition(
          this.monomerItem.attachmentPoints,
        );
      return attachmentPointDictionary;
    } else {
      return this.getAttachmentPointDictFromAtoms();
    }
  }

  public static getAttachmentPointDictFromMonomerDefinition(
    attachmentPoints: IKetAttachmentPoint[],
  ): {
    attachmentPointDictionary: AttachmentPointsToBonds;
    attachmentPointsList: AttachmentPointName[];
  } {
    const attachmentPointDictionary = {};
    const attachmentPointsList: AttachmentPointName[] = [];
    const attachmentPointTypeToNumber: {
      [key in IKetAttachmentPointType]: (
        attachmentPointNumber?: number,
      ) => number;
    } = {
      left: () => 1,
      right: () => 2,
      side: (attachmentPointNumber) => {
        assert(attachmentPointNumber);
        return (
          attachmentPointNumber +
          Number(!('R1' in attachmentPointDictionary)) +
          Number(!('R2' in attachmentPointDictionary))
        );
      },
    };
    attachmentPoints.forEach((attachmentPoint, attachmentPointIndex) => {
      const attachmentPointNumber = attachmentPointIndex + 1;
      let calculatedAttachmentPointNumber;
      if (attachmentPoint.type) {
        const getLabelByTypeAction =
          attachmentPointTypeToNumber[attachmentPoint.type];
        calculatedAttachmentPointNumber =
          typeof getLabelByTypeAction === 'function'
            ? attachmentPointTypeToNumber[attachmentPoint.type](
                attachmentPointNumber,
              )
            : attachmentPointNumber;
      } else {
        calculatedAttachmentPointNumber = attachmentPointNumber;
      }
      const calculatedLabel =
        attachmentPoint.label ?? `R${calculatedAttachmentPointNumber}`;
      attachmentPointDictionary[calculatedLabel] = null;
      attachmentPointsList.push(calculatedLabel as AttachmentPointName);
    });
    return { attachmentPointDictionary, attachmentPointsList };
  }

  public get attachmentPointNumberToType() {
    return {
      1: 'left',
      2: 'right',
      moreThanTwo: 'side',
    };
  }

  private getMonomerDefinitionAttachmentPoints() {
    const monomerDefinitionAttachmentPoints: IKetAttachmentPoint[] = [];
    this.superatomAttachmentPoints.forEach((superatomAttachmentPoint) => {
      if (!isNumber(superatomAttachmentPoint.attachmentPointNumber)) {
        return;
      }

      const bondsToLeavingGroupAtom = this.monomerItem.struct.bonds.filter(
        (_, bond) => {
          return (
            bond.begin === superatomAttachmentPoint.leaveAtomId ||
            bond.end === superatomAttachmentPoint.leaveAtomId
          );
        },
      );

      if (bondsToLeavingGroupAtom.size > 1) {
        return;
      }

      monomerDefinitionAttachmentPoints.push({
        attachmentAtom: superatomAttachmentPoint.atomId,
        leavingGroup: {
          atoms:
            superatomAttachmentPoint.leaveAtomId === 0 ||
            superatomAttachmentPoint.leaveAtomId
              ? [superatomAttachmentPoint.leaveAtomId]
              : [],
        },
        type:
          this.attachmentPointNumberToType[
            superatomAttachmentPoint.attachmentPointNumber
          ] ?? this.attachmentPointNumberToType.moreThanTwo,
      });
    });
    return monomerDefinitionAttachmentPoints;
  }

  get superatomAttachmentPoints() {
    const struct = this.monomerItem.struct;
    const superatomWithoutLabel = struct.sgroups
      .filter((_, sgroup) => sgroup.isSuperatomWithoutLabel)
      ?.get(0);

    if (!superatomWithoutLabel) {
      return [];
    }

    return superatomWithoutLabel.getAttachmentPoints();
  }

  public getAttachmentPointDictFromAtoms(): AttachmentPointsToBonds {
    const attachmentPointNameToBond = {};

    this.superatomAttachmentPoints.forEach((superatomAttachmentPoint) => {
      if (!isNumber(superatomAttachmentPoint.attachmentPointNumber)) {
        return;
      }

      const label = getAttachmentPointLabel(
        superatomAttachmentPoint.attachmentPointNumber,
      );
      const leavingGroupAtomId = superatomAttachmentPoint.leaveAtomId;
      const bondsToLeavingGroupAtom = this.monomerItem.struct.bonds.filter(
        (_, bond) => {
          return (
            bond.begin === leavingGroupAtomId || bond.end === leavingGroupAtomId
          );
        },
      );

      if (bondsToLeavingGroupAtom.size > 1) {
        return;
      }

      attachmentPointNameToBond[label] = null;
    });

    return attachmentPointNameToBond;
  }

  public get startBondAttachmentPoint(): AttachmentPointName | undefined {
    if (this.chosenFirstAttachmentPointForBond) {
      return this.chosenFirstAttachmentPointForBond;
    }
    if (this.attachmentPointsToBonds.R2 === null) {
      return AttachmentPointName.R2;
    }

    if (this.attachmentPointsToBonds.R1 === null) {
      return AttachmentPointName.R1;
    }

    return this.firstFreeAttachmentPoint;
  }

  abstract get SubChainConstructor():
    | typeof RnaSubChain
    | typeof ChemSubChain
    | typeof PhosphateSubChain
    | typeof PeptideSubChain;

  public isMonomerTypeDifferentForChaining(
    monomerToChain: SubChainNode | BaseMonomer,
  ) {
    return this.SubChainConstructor !== monomerToChain.SubChainConstructor;
  }

  public get isModification() {
    const naturalAnalogThreeLettersCode =
      this.monomerItem.props.MonomerNaturalAnalogThreeLettersCode;
    const naturalAnalogCode = this.monomerItem.props.MonomerNaturalAnalogCode;
    const namesToCompareNaturalAnalog = [
      this.label,
      this.monomerItem.props.MonomerName,
    ];
    const naturalAnaloguesToCompare = [
      ...(naturalAnalogThreeLettersCode ? [naturalAnalogThreeLettersCode] : []),
      naturalAnalogCode,
    ];

    return namesToCompareNaturalAnalog.every(
      (nameToCompare) => !naturalAnaloguesToCompare.includes(nameToCompare),
    );
  }

  public get sideConnections() {
    const sideConnections: PolymerBond[] = [];
    this.forEachBond((bond) => {
      if (!(bond instanceof MonomerToAtomBond) && bond.isSideChainConnection) {
        sideConnections.push(bond);
      }
    });
    return sideConnections;
  }

  public get monomerCaps() {
    return this.monomerItem.props.MonomerCaps;
  }

  public recalculateAttachmentPoints() {
    const oldAttachmentPointsToBonds = this.attachmentPointsToBonds;

    this.attachmentPointsToBonds = this.getAttachmentPointDict();
    for (const attachmentPointName in this.attachmentPointsToBonds) {
      if (oldAttachmentPointsToBonds[attachmentPointName]) {
        this.attachmentPointsToBonds[attachmentPointName] =
          oldAttachmentPointsToBonds[attachmentPointName];
      }
    }

    this.potentialAttachmentPointsToBonds = this.getAttachmentPointDict();
  }
}
