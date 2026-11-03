import { Vec2 } from 'domain/entities/vec2';

import { BaseOperation } from './BaseOperation';
import { OperationType } from './OperationType';
import type { ReStruct } from '../../render';

export type CipLabelOwner = 'atoms' | 'bonds';

export class CipLabelMove extends BaseOperation<{
  owner: CipLabelOwner;
  id: number;
  delta: Vec2;
}> {
  constructor(owner: CipLabelOwner, id: number, delta: Vec2) {
    super(OperationType.CIP_LABEL_MOVE);
    this.data = { owner, id, delta };
  }

  execute(restruct: ReStruct) {
    const { owner, id, delta } = this.data;
    const entity = restruct.molecule[owner].get(id);
    if (!entity) return;

    entity.cipLabelOffset = Vec2.sum(
      entity.cipLabelOffset ?? new Vec2(),
      delta,
    );
    BaseOperation.invalidateItem(restruct, owner, id, 1);
  }

  invert() {
    const { owner, id, delta } = this.data;
    return new CipLabelMove(owner, id, delta.negated());
  }

  isDummy() {
    const { delta } = this.data;
    return delta.x === 0 && delta.y === 0;
  }
}
