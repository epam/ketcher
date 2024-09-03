import { KetFileNode } from 'domain/serializers';
import { KetFileMultitailArrowNode, MultitailArrow } from 'domain/entities';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from 'domain/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateMultitailArrows = (json: any): boolean => {
  const nodes: Array<KetFileNode<unknown | KetFileMultitailArrowNode>> =
    json.root.nodes;
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
