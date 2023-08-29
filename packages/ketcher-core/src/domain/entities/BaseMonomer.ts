import { DrawingEntity } from './DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';

export class BaseMonomer extends DrawingEntity {
  public renderer?: BaseMonomerRenderer;
  public attachmentPointsToBonds: Record<
    AttachmentPointName,
    PolymerBond | null
  > = {
    R1: null,
    R2: null,
  };

  public potentialAttachmentPointsToBonds: {
    [key: string]: PolymerBond | null | undefined;
  } = {
    R1: null,
    R2: null,
  };

  constructor(private _monomerItem: MonomerItemType, _position?: Vec2) {
    super(_position);
  }

  get monomerItem() {
    return this._monomerItem;
  }

  get label() {
    return this.monomerItem.label;
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
    for (const attachmentPoint in this.attachmentPointsToBonds) {
      if (this.attachmentPointsToBonds[attachmentPoint] === null) {
        return attachmentPoint;
      }
    }

    return undefined;
  }

  public get R1AttachmentPoint() {
    if (this.attachmentPointsToBonds.R1 === null) {
      return 'R1';
    }

    return undefined;
  }

  public get R2AttachmentPoint() {
    if (this.attachmentPointsToBonds.R2 === null) {
      return 'R2';
    }

    return undefined;
  }

  public get hasFreeAttachmentPoint() {
    return Boolean(this.firstFreeAttachmentPoint);
  }

  public setRenderer(renderer: BaseMonomerRenderer) {
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
    return this.isAttachmentPointUsed('R2')
      ? this.firstFreeAttachmentPoint
      : 'R2';
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
}
