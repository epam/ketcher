import {
  Struct,
  MultitailArrow,
  KetFileMultitailArrowNode,
} from 'domain/entities';
import { KetFileNode } from 'domain/serializers';

export function multitailArrowToStruct(
  ketItem: KetFileNode<KetFileMultitailArrowNode>,
  struct: Struct,
) {
  struct.multitailArrows.add(MultitailArrow.fromKetNode(ketItem));
  return struct;
}
