import { Atom, AtomAttributes } from './atom';
import type { Struct } from './struct';
import { Vec2 } from './vec2';

export interface SuperAttachmentPointAttributes
  extends Partial<Omit<AtomAttributes, 'label'>> {
  endpoints: number[];
}

/**
 * A SuperAttachmentPoint is a dummy atom with label "*"
 * Definition: https://github.com/epam/ketcher/issues/8390
 */
export class SuperAttachmentPoint extends Atom {
  endpoints: number[];

  constructor(attributes: SuperAttachmentPointAttributes) {
    super({ ...attributes, label: '*' } as AtomAttributes);
    this.endpoints = [...attributes.endpoints];
  }

  recomputeCenter(struct: Struct): Vec2 {
    if (this.endpoints.length === 0) {
      this.pp = new Vec2();
      return this.pp;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const aid of this.endpoints) {
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

  clone(fidMap?: Map<number, number>): SuperAttachmentPoint {
    const ret = new SuperAttachmentPoint({
      endpoints: this.endpoints,
      fragment: this.fragment,
      pp: this.pp,
    });
    ret.pp = new Vec2(this.pp.x, this.pp.y);
    const fragmentId = fidMap?.get(this.fragment);
    if (fragmentId !== undefined) ret.fragment = fragmentId;
    return ret;
  }

  // Endpoint ids in `this.endpoints` are NOT remapped by clone() because the
  // atom-id remap isn't available at clone time during Struct.mergeInto.
  // Struct remaps them in a second pass once all atoms have been cloned.
  remapEndpoints(aidMap: Map<number, number>): void {
    this.endpoints = this.endpoints.map((aid) => aidMap.get(aid) ?? aid);
  }

  static findForAtom(
    struct: Struct,
    atomId: number,
  ): { id: number; superAttachmentPoint: SuperAttachmentPoint } | null {
    for (const [id, atom] of struct.atoms.entries()) {
      if (
        atom instanceof SuperAttachmentPoint &&
        atom.endpoints.includes(atomId)
      ) {
        return { id, superAttachmentPoint: atom };
      }
    }
    return null;
  }
}
