import type {
  KetFileNode,
  KetFileRootContent,
} from 'domain/serializers/serializers.types';
import {
  type KetFileMultitailArrowNode,
  MultitailArrow,
} from 'domain/entities/multitailArrow';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from 'domain/constants';

export const validateMultitailArrows = (json: KetFileRootContent): boolean => {
  const nodes: Array<KetFileNode<unknown>> = json.root.nodes;
  return nodes.every((node) => {
    if (node.type === MULTITAIL_ARROW_SERIALIZE_KEY) {
      const result = MultitailArrow.validateKetNode(
        node.data as KetFileMultitailArrowNode,
      );
      if (result !== null) {
        console.info(result);
        return null;
      }
    }
    return true;
  });
};
