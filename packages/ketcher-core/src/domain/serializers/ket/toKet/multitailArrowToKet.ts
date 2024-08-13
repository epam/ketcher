import { KetFileNode } from 'domain/serializers';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from 'domain/constants';

export function multitailArrowToKet(node: KetFileNode) {
  return {
    type: MULTITAIL_ARROW_SERIALIZE_KEY,
    data: node.data,
    selected: node.selected,
  };
}
