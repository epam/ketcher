import type { KetFileNode } from 'domain/serializers/serializers.types';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from '../../../constants/multitailArrow';

export function multitailArrowToKet(node: KetFileNode) {
  return {
    type: MULTITAIL_ARROW_SERIALIZE_KEY,
    data: node.data,
    selected: node.selected,
  };
}
