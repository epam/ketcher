import { DrawingEntity } from './DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { convertAttachmentPointNumberToLabel } from 'domain/helpers/attachmentPointCalculations';

export class BaseMonomer extends DrawingEntity {
  public renderer?: BaseMonomerRenderer = undefined;
  public attachmentPointsToBonds: Partial<
    Record<AttachmentPointName, PolymerBond | null>
  > = {
    R1: null,
  };

  public potentialAttachmentPointsToBonds: {
    [key: string]: PolymerBond | null | undefined;
  } = {
    R1: null,
  };

  public attachmentPointsVisible = false;

  constructor(private _monomerItem: MonomerItemType, _position?: Vec2) {
    super(_position);

    this.attachmentPointsToBonds = this.getAttachmentPointDict();
    this.potentialAttachmentPointsToBonds = this.getAttachmentPointDict();
  }

  get monomerItem() {
    return this._monomerItem;
  }

  get label() {
    return this.monomerItem.label;
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

  public setPotentialBond(
    attachmentPoint: string,
    potentialBond?: PolymerBond | null,
  ) {
    this.potentialAttachmentPointsToBonds[attachmentPoint] = potentialBond;
  }

  public getAttachmentPointByBond(bond: PolymerBond) {
    for (const attachmentPointName in this.attachmentPointsToBonds) {
      if (this.attachmentPointsToBonds[attachmentPointName] === bond) {
        return attachmentPointName;
      }
    }

    return undefined;
  }

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
      const attachmentPoint = `R${i}`;
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

  public setRenderer(renderer: BaseMonomerRenderer) {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  public forEachBond(callback) {
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

  public getPotentialBond(attachmentPointName: string) {
    return this.potentialAttachmentPointsToBonds[attachmentPointName];
  }

  public removePotentialBonds() {
    for (const attachmentPointName in this.potentialAttachmentPointsToBonds) {
      this.potentialAttachmentPointsToBonds[attachmentPointName] = null;
    }
  }

  public get availableAttachmentPointForBondEnd() {
    return this.firstFreeAttachmentPoint;
  }

  public hasAttachmentPoint(attachmentPointName: string) {
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
    const list: string[] = [];
    for (const attachmentPointName in this.attachmentPointsToBonds) {
      if (
        !this.isAttachmentPointUsed(attachmentPointName as AttachmentPointName)
      ) {
        list.push(attachmentPointName);
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
    const attachmentAtoms = this.monomerItem.struct.atoms.filter((_, value) => {
      return Boolean(value.rglabel);
    });
    const attachmentPointNameToBond = {};

    attachmentAtoms.forEach((atom, _) => {
      const label = convertAttachmentPointNumberToLabel(Number(atom.rglabel));
      attachmentPointNameToBond[label] = null;
    });

    return attachmentPointNameToBond;
  }

  public get startBondAttachmentPoint() {
    if (this.attachmentPointsToBonds.R2 === null) {
      return 'R2';
    }

    if (this.attachmentPointsToBonds.R1 === null) {
      return 'R1';
    }

    return this.firstFreeAttachmentPoint;
  }
}
