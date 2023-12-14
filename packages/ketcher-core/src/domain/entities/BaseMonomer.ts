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

export abstract class BaseMonomer extends DrawingEntity {
  public renderer?: BaseMonomerRenderer = undefined;
  public attachmentPointsToBonds: Partial<
    Record<AttachmentPointName, PolymerBond | null>
  > = {
    R1: null,
  };

  public chosenFirstAttachmentPointForBond: string | null;
  public potentialSecondAttachmentPointForBond: string | null;
  public chosenSecondAttachmentPointForBond: string | null;

  public potentialAttachmentPointsToBonds: {
    [key: string]: PolymerBond | null | undefined;
  } = {
    R1: null,
  };

  public attachmentPointsVisible = false;
  public monomerItem: MonomerItemType;
  constructor(monomerItem: MonomerItemType, _position?: Vec2) {
    super(_position);

    this.monomerItem = { ...monomerItem };
    this.attachmentPointsToBonds = this.getAttachmentPointDict();
    this.potentialAttachmentPointsToBonds = this.getAttachmentPointDict();
    this.chosenFirstAttachmentPointForBond = null;
    this.potentialSecondAttachmentPointForBond = null;
    this.chosenSecondAttachmentPointForBond = null;
    this.monomerItem.attachmentPoints =
      this.monomerItem.attachmentPoints ||
      this.getMonomerDefinitionAttachmentPoints();
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

  public setChosenFirstAttachmentPoint(attachmentPoint: string | null) {
    this.chosenFirstAttachmentPointForBond = attachmentPoint;
  }

  public setChosenSecondAttachmentPoint(attachmentPoint: string | null) {
    this.chosenSecondAttachmentPointForBond = attachmentPoint;
  }

  public setPotentialSecondAttachmentPoint(attachmentPoint: string | null) {
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
  ): string | undefined;

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
      return 'R1';
    }

    return undefined;
  }

  public get R2AttachmentPoint(): AttachmentPointName | undefined {
    if (this.attachmentPointsToBonds.R2 === null) {
      return 'R2';
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

  public forEachBond(callback: (polymerBond: PolymerBond) => void) {
    for (const attachmentPointName in this.attachmentPointsToBonds) {
      if (this.attachmentPointsToBonds[attachmentPointName]) {
        callback(this.attachmentPointsToBonds[attachmentPointName]);
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
      return this.getAttachmentPointDictFromMonomerDefinition();
    } else {
      return this.getAttachmentPointDictFromAtoms();
    }
  }

  public getAttachmentPointDictFromMonomerDefinition(): Partial<
    Record<AttachmentPointName, PolymerBond | null>
  > {
    assert(this.monomerItem.attachmentPoints);
    const attachmentPointDictionnary = {};
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
          Number(!('R1' in attachmentPointDictionnary)) -
          Number(!('R2' in attachmentPointDictionnary))
        );
      },
    };
    this.monomerItem.attachmentPoints.forEach(
      (attachmentPoint, attachmentPointIndex) => {
        const attachmentPointNumber = attachmentPointIndex + 1;
        const calculatedLabel = `R${
          attachmentPoint.type
            ? attachmentPointTypeToNumber[attachmentPoint.type](
                attachmentPointNumber,
              )
            : attachmentPointNumber
        }`;
        attachmentPointDictionnary[attachmentPoint.label || calculatedLabel] =
          null;
      },
    );
    return attachmentPointDictionnary;
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
    this.leavingGroupsAtoms.forEach((leavingGroupsAtom) => {
      const bondId = this.monomerItem.struct.bonds.find((_, bond) => {
        return (
          bond.begin === leavingGroupsAtom.id ||
          bond.end === leavingGroupsAtom.id
        );
      });
      let attachmentAtomId: number;
      let leavingGroupsAtomId: number | undefined;

      if (bondId) {
        const bond = this.monomerItem.struct.bonds.get(bondId) as Bond;
        attachmentAtomId =
          bond.begin === leavingGroupsAtom.id ? bond.end : bond.begin;
        leavingGroupsAtomId = leavingGroupsAtom.id;
      } else {
        attachmentAtomId = leavingGroupsAtom.id;
      }

      monomerDefinitionAttachmentPoints.push({
        attachmentAtom: attachmentAtomId,
        leavingGroup: {
          atoms: leavingGroupsAtomId ? [leavingGroupsAtomId] : [],
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
    leavingGroupsAtoms.forEach((attachmentAtom, attachmentAtomId) => {
      leavingGroupsAtomsArray.push({
        id: attachmentAtomId,
        rglabel: Number(attachmentAtom.rglabel),
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

    this.leavingGroupsAtoms.forEach(({ rglabel }, _) => {
      const label = convertAttachmentPointNumberToLabel(Number(rglabel));
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
}
