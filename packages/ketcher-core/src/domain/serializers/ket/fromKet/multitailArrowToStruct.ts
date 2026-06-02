import type { Struct } from 'domain/entities/struct';
import {
  MultitailArrow,
  type KetFileMultitailArrowNode,
} from 'domain/entities/multitailArrow';
import type { KetFileNode } from 'domain/serializers/serializers.types';

export function multitailArrowToStruct(
  ketItem: KetFileNode<KetFileMultitailArrowNode>,
  struct: Struct,
) {
  struct.addMultitailArrow(MultitailArrow.fromKetNode(ketItem));
  return struct;
}
