import type { Vec2 } from 'domain/entities/vec2';
import type { ReStruct } from '../../render';
import { Action } from './action';
import { CipLabelMove, type CipLabelOwner } from '../operations';

export function fromCipLabelMove(
  restruct: ReStruct,
  owner: CipLabelOwner,
  id: number,
  delta: Vec2,
) {
  const action = new Action();
  action.addOp(new CipLabelMove(owner, id, delta));
  return action.perform(restruct);
}
