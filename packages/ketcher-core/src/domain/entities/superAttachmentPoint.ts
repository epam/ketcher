import {
  BaseMicromoleculeEntity,
  initiallySelectedType,
} from 'domain/entities/BaseMicromoleculeEntity';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

export interface SuperAttachmentPointAttributes {
  atoms: number[];
  initiallySelected?: initiallySelectedType;
}

export class SuperAttachmentPoint extends BaseMicromoleculeEntity {
  atoms: number[];
  pp: Vec2;

  constructor(attributes: SuperAttachmentPointAttributes) {
    super(attributes.initiallySelected);
    this.atoms = [...attributes.atoms];
    this.pp = new Vec2();
  }

  fragmentId(struct: Struct): number {
    if (this.atoms.length === 0) return -1;
    return struct.atoms.get(this.atoms[0])?.fragment ?? -1;
  }

  recomputeCenter(struct: Struct): Vec2 {
    if (this.atoms.length === 0) {
      this.pp = new Vec2();
      return this.pp;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const aid of this.atoms) {
      const atom = struct.atoms.get(aid);
      if (!atom) continue;
      if (atom.pp.x < minX) minX = atom.pp.x;
      if (atom.pp.y < minY) minY = atom.pp.y;
      if (atom.pp.x > maxX) maxX = atom.pp.x;
      if (atom.pp.y > maxY) maxY = atom.pp.y;
    }
    this.pp = new Vec2((minX + maxX) / 2, (minY + maxY) / 2);
    return this.pp;
  }

  clone(aidMap?: Map<number, number> | null): SuperAttachmentPoint {
    const cp = new SuperAttachmentPoint({ atoms: this.atoms });
    cp.pp = new Vec2(this.pp.x, this.pp.y);
    if (aidMap) {
      cp.atoms = cp.atoms.map((aid) => aidMap.get(aid) ?? aid);
    }
    return cp;
  }

  static findForAtom(
    struct: Struct,
    atomId: number,
  ): SuperAttachmentPoint | null {
    for (const sap of struct.superAttachmentPoints.values()) {
      if (sap.atoms.includes(atomId)) return sap;
    }
    return null;
  }
}
