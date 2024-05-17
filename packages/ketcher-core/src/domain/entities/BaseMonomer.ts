import { DrawingEntity } from './DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { convertAttachmentPointNumberToLabel } from 'domain/helpers/attachmentPointCalculations';
import assert from 'assert';
import {
  IKetAttachmentPoint,
  IKetAttachmentPointType,
} from 'application/formatters/types/ket';
import { Bond } from 'domain/entities/bond';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';
import { PeptideSubChain } from 'domain/entities/monomer-chains/PeptideSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { PhosphateSubChain } from 'domain/entities/monomer-chains/PhosphateSubChain';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { Pool } from 'domain/entities/pool';

export abstract class BaseMonomer extends DrawingEntity {
  public renderer?: BaseMonomerRenderer | BaseSequenceItemRenderer = undefined;
  public attachmentPointsToBonds: Partial<
    Record<AttachmentPointName, PolymerBond | null>
  > = {};

  public chosenFirstAttachmentPointForBond: AttachmentPointName | null;
  public potentialSecondAttachmentPointForBond: AttachmentPointName | null;
  public chosenSecondAttachmentPointForBond: AttachmentPointName | null;

  public potentialAttachmentPointsToBonds: {
    [key: string]: PolymerBond | null | undefined;
  } = {};

  public attachmentPointsVisible = false;
  public monomerItem: MonomerItemType;
  public isMonomerInRnaChainRow = false;

  constructor(monomerItem: MonomerItemType, _position?: Vec2) {
    super(_position);

    this.monomerItem = { ...monomerItem };
    this.attachmentPointsToBonds = this.getAttachmentPointDict();
    this.potentialAttachmentPointsToBonds = this.getAttachmentPointDict();
    this.monomerItem.attachmentPoints =
      this.monomerItem.attachmentPoints ||
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
    const attachmentPointList: string[] = [];
    for (let i = 1; i <= maxAttachmentPointNumber; i++) {
      if (this.attachmentPointsToBonds[`R${i}`] !== undefined) {
        attachmentPointList.push(`R${i}`);
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
    potentialBond?: PolymerBond | null,
  ) {
    if (attachmentPoint !== undefined) {
      this.potentialAttachmentPointsToBonds[attachmentPoint] = potentialBond;
    }
  }

  public getAttachmentPointByBond(
    bond: PolymerBond,
  ): AttachmentPointName | undefined {
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
        return attachmentPointName;
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
      const match = attachmentPoint.match(/R(\d+)/);
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

  public setRenderer(renderer: BaseMonomerRenderer) {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  public forEachBond(
    callback: (
      polymerBond: PolymerBond,
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
  }

  public setBond(attachmentPointName: string, bond: PolymerBond) {
    this.attachmentPointsToBonds[attachmentPointName] = bond;
  }

  public unsetBond(attachmentPointName: string) {
    this.attachmentPointsToBonds[attachmentPointName] = null;
  }

  public get hasBonds() {
    let hasBonds = false;
    for (const bondName in this.attachmentPointsToBonds) {
      if (this.attachmentPointsToBonds[bondName]) {
        hasBonds = true;
      }
    }
    return hasBonds;
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

  public get usedAttachmentPointsNamesList() {
    const list: AttachmentPointName[] = [];
    for (const attachmentPointName in this.attachmentPointsToBonds) {
      if (
        this.isAttachmentPointUsed(attachmentPointName as AttachmentPointName)
      ) {
        list.push(attachmentPointName as AttachmentPointName);
      }
    }
    return list;
  }

  public get unUsedAttachmentPointsNamesList() {
    const list: AttachmentPointName[] = [];
    for (const attachmentPointName in this.attachmentPointsToBonds) {
      if (
        !this.isAttachmentPointUsed(attachmentPointName as AttachmentPointName)
      ) {
        list.push(attachmentPointName as AttachmentPointName);
      }
    }
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

  private getAttachmentPointDict(): Partial<
    Record<AttachmentPointName, PolymerBond | null>
  > {
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
    attachmentPointDictionary: Partial<
      Record<AttachmentPointName, PolymerBond | null>
    >;
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
        attachmentPoint.label || `R${calculatedAttachmentPointNumber}`;
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

  private isRglabelConvertableToAttachmentPoint(
    rglabel: number | string,
    bondsToRgLabel: Pool<Bond>,
  ) {
    const label =
      typeof rglabel === 'string'
        ? rglabel
        : convertAttachmentPointNumberToLabel(rglabel);

    // Do not create attachment point if:
    // there are multiple bonds to same leaving group atom
    // there are multiple rglabels on same leaving group atom
    // rglabel more than 8 (support only 8 attachment points in macromolecules mode)
    return (
      bondsToRgLabel.size === 1 &&
      label.length === 2 &&
      Number(label.replace('R', '')) <= 8
    );
  }

  private getMonomerDefinitionAttachmentPoints() {
    const monomerDefinitionAttachmentPoints: IKetAttachmentPoint[] = [];
    this.leavingGroupsAtoms.forEach((leavingGroupsAtom) => {
      const bondsToLeavingGroupAtom = this.monomerItem.struct.bonds.filter(
        (_, bond) => {
          return (
            bond.begin === leavingGroupsAtom.id ||
            bond.end === leavingGroupsAtom.id
          );
        },
      );

      if (
        !this.isRglabelConvertableToAttachmentPoint(
          leavingGroupsAtom.rglabel,
          bondsToLeavingGroupAtom,
        )
      ) {
        return;
      }

      let attachmentAtomId: number;
      let leavingGroupsAtomId: number | undefined;
      const bondToLeavingGroupAtom = bondsToLeavingGroupAtom.get(0);

      if (bondToLeavingGroupAtom) {
        attachmentAtomId =
          bondToLeavingGroupAtom.begin === leavingGroupsAtom.id
            ? bondToLeavingGroupAtom.end
            : bondToLeavingGroupAtom.begin;
        leavingGroupsAtomId = leavingGroupsAtom.id;
      } else {
        attachmentAtomId = leavingGroupsAtom.id;
      }

      monomerDefinitionAttachmentPoints.push({
        attachmentAtom: attachmentAtomId,
        leavingGroup: {
          atoms:
            leavingGroupsAtomId === 0 || leavingGroupsAtomId
              ? [leavingGroupsAtomId]
              : [],
        },
        type:
          this.attachmentPointNumberToType[leavingGroupsAtom.rglabel] ||
          this.attachmentPointNumberToType.moreThanTwo,
      });
    });
    return monomerDefinitionAttachmentPoints;
  }

  get leavingGroupsAtoms() {
    const leavingGroupsAtoms = this.monomerItem.struct.atoms.filter(
      (_, value) => {
        return Boolean(value.rglabel);
      },
    );
    const leavingGroupsAtomsArray: { id: number; rglabel: number }[] = [];
    leavingGroupsAtoms.forEach((leavingGroupAtom, leavingGroupAtomId) => {
      leavingGroupsAtomsArray.push({
        id: leavingGroupAtomId,
        rglabel: Number(leavingGroupAtom.rglabel),
      });
    });
    leavingGroupsAtomsArray.sort((atom1, atom2) =>
      Number(atom1.rglabel) > Number(atom2.rglabel) ? 1 : -1,
    );
    return leavingGroupsAtomsArray;
  }

  public getAttachmentPointDictFromAtoms(): Partial<
    Record<AttachmentPointName, PolymerBond | null>
  > {
    const attachmentPointNameToBond = {};

    this.leavingGroupsAtoms.forEach(({ rglabel, id }, _) => {
      const label = convertAttachmentPointNumberToLabel(Number(rglabel));
      const leavingGroupAtomId = id;
      const bondsToLeavingGroupAtom = this.monomerItem.struct.bonds.filter(
        (_, bond) => {
          return (
            bond.begin === leavingGroupAtomId || bond.end === leavingGroupAtomId
          );
        },
      );

      if (
        !this.isRglabelConvertableToAttachmentPoint(
          label,
          bondsToLeavingGroupAtom,
        )
      ) {
        return;
      }

      attachmentPointNameToBond[label] = null;
    });

    return attachmentPointNameToBond;
  }

  public get startBondAttachmentPoint() {
    if (this.chosenFirstAttachmentPointForBond) {
      return this.chosenFirstAttachmentPointForBond;
    }
    if (this.attachmentPointsToBonds.R2 === null) {
      return 'R2';
    }

    if (this.attachmentPointsToBonds.R1 === null) {
      return 'R1';
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
    return this.monomerItem.props.MonomerNaturalAnalogCode !== this.label;
  }

  public get sideConnections() {
    const sideConnections: PolymerBond[] = [];
    this.forEachBond((bond) => {
      if (bond.isSideChainConnection) {
        sideConnections.push(bond);
      }
    });
    return sideConnections;
  }
}
