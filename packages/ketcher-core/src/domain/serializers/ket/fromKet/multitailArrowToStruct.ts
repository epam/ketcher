import {
  MultitailArrow,
  KetFileMultitailArrowNode,
} from 'domain/entities/multitailArrow';
import { Struct } from 'domain/entities/struct';
import { KetFileNode } from 'domain/serializers';

export function multitailArrowToStruct(
  ketItem: KetFileNode<KetFileMultitailArrowNode>,
  struct: Struct,
) {
  struct.multitailArrows.add(MultitailArrow.fromKetNode(ketItem));
  return struct;
}
