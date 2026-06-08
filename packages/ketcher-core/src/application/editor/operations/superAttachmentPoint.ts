import { Pile } from 'domain/entities/pile';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';
import { ReStruct } from '../../render';
import ReSuperAttachmentPoint from '../../render/restruct/reSuperAttachmentPoint';

import { BaseOperation } from './BaseOperation';
import { OperationType } from './OperationType';

class SuperAttachmentPointAdd extends BaseOperation {
  static InverseConstructor: new (
    superAttachmentPointAtomId: number,
  ) => BaseOperation;

  superAttachmentPointAtomId: number | null;
  readonly endpoints: number[];

  constructor(endpoints: number[], superAttachmentPointAtomId?: number) {
    super(OperationType.SUPER_ATTACHMENT_POINT_ADD);
    this.endpoints = [...endpoints];
    this.superAttachmentPointAtomId = superAttachmentPointAtomId ?? null;
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const fragment = struct.atoms.get(this.endpoints[0])?.fragment ?? -1;
    const superAttachmentPoint = new SuperAttachmentPoint({
      endpoints: this.endpoints,
      fragment,
    });
    superAttachmentPoint.recomputeCenter(struct);

    let aid: number;
    if (this.superAttachmentPointAtomId === null) {
      aid = struct.atoms.add(superAttachmentPoint);
      this.superAttachmentPointAtomId = aid;
    } else {
      aid = this.superAttachmentPointAtomId;
      struct.atoms.set(aid, superAttachmentPoint);
    }

    const reAtom = new ReSuperAttachmentPoint(superAttachmentPoint);
    reAtom.component = restruct.connectedComponents.add(new Pile([aid]));
    restruct.atoms.set(aid, reAtom);
    restruct.markAtom(aid, 1);
  }

  invert() {
    return new SuperAttachmentPointAdd.InverseConstructor(
      this.superAttachmentPointAtomId as number,
    );
  }
}

class SuperAttachmentPointDelete extends BaseOperation {
  static InverseConstructor: new (
    endpoints: number[],
    superAttachmentPointAtomId?: number,
  ) => BaseOperation;

  readonly superAttachmentPointAtomId: number;
  capturedEndpoints: number[] | null = null;

  constructor(superAttachmentPointAtomId: number) {
    super(OperationType.SUPER_ATTACHMENT_POINT_DELETE, 100);
    this.superAttachmentPointAtomId = superAttachmentPointAtomId;
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const superAttachmentPoint = struct.atoms.get(
      this.superAttachmentPointAtomId,
    );
    if (!(superAttachmentPoint instanceof SuperAttachmentPoint)) return;
    this.capturedEndpoints = [...superAttachmentPoint.endpoints];

    const reAtom = restruct.atoms.get(this.superAttachmentPointAtomId);
    if (reAtom) {
      const set = restruct.connectedComponents.get(reAtom.component);
      set?.delete(this.superAttachmentPointAtomId);
      if (set?.size === 0) {
        restruct.connectedComponents.delete(reAtom.component);
      }
      restruct.clearVisel(reAtom.visel);
    }

    struct.atoms.delete(this.superAttachmentPointAtomId);
    restruct.atoms.delete(this.superAttachmentPointAtomId);
    restruct.markItemRemoved();
  }

  invert() {
    return new SuperAttachmentPointDelete.InverseConstructor(
      this.capturedEndpoints ?? [],
      this.superAttachmentPointAtomId,
    );
  }
}

class SuperAttachmentPointEndpointsChange extends BaseOperation {
  readonly superAttachmentPointAtomId: number;
  readonly newEndpoints: number[];
  private previousEndpoints: number[] | null = null;

  constructor(superAttachmentPointAtomId: number, newEndpoints: number[]) {
    super(OperationType.SUPER_ATTACHMENT_POINT_ENDPOINTS_CHANGE);
    this.superAttachmentPointAtomId = superAttachmentPointAtomId;
    this.newEndpoints = [...newEndpoints];
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const superAttachmentPoint = struct.atoms.get(
      this.superAttachmentPointAtomId,
    );
    if (!(superAttachmentPoint instanceof SuperAttachmentPoint)) return;
    // Defense-in-depth: refuse if any incoming endpoint belongs to a
    // different SAP. The action layer guards this too, but a direct op
    // construction shouldn't be able to violate one-SAP-per-atom.
    for (const aid of this.newEndpoints) {
      const other = SuperAttachmentPoint.findForAtom(struct, aid);
      if (other && other.id !== this.superAttachmentPointAtomId) return;
    }
    this.previousEndpoints = [...superAttachmentPoint.endpoints];
    superAttachmentPoint.endpoints = [...this.newEndpoints];
    superAttachmentPoint.recomputeCenter(struct);
    restruct.markAtom(this.superAttachmentPointAtomId, 1);
  }

  invert() {
    return new SuperAttachmentPointEndpointsChange(
      this.superAttachmentPointAtomId,
      this.previousEndpoints ?? [],
    );
  }
}

SuperAttachmentPointAdd.InverseConstructor = SuperAttachmentPointDelete;
SuperAttachmentPointDelete.InverseConstructor = SuperAttachmentPointAdd;

export {
  SuperAttachmentPointAdd,
  SuperAttachmentPointDelete,
  SuperAttachmentPointEndpointsChange,
};
