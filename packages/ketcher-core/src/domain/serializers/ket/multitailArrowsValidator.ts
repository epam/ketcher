import { KetFileNode } from 'domain/serializers';
import { KetFileMultitailArrowNode, MultitailArrow } from 'domain/entities';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from 'domain/constants';

type KetWithNodes = {
  root: {
    nodes: Array<KetFileNode<unknown>>;
  };
};

export const validateMultitailArrows = (json: KetWithNodes): boolean => {
  const nodes: Array<KetFileNode<unknown>> = json.root.nodes;
  return nodes.every((node) => {
    if (node.type === MULTITAIL_ARROW_SERIALIZE_KEY) {
      const result = MultitailArrow.validateKetNode(
        node.data as KetFileMultitailArrowNode,
      );
      if (result !== null) {
        console.info(result);
        return false;
      }
    }
    return true;
  });
};
