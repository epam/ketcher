import { KetFileNode } from 'domain/serializers';
import { KetFileMultitailArrowNode, MultitailArrow } from 'domain/entities';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from 'domain/constants';

export interface MultitailArrowsValidationResult {
  isValid: boolean;
  error?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateMultitailArrows = (
  json: any,
): MultitailArrowsValidationResult => {
  const nodes: Array<KetFileNode<unknown | KetFileMultitailArrowNode>> =
    json.root.nodes;

  for (const node of nodes) {
    if (node.type === MULTITAIL_ARROW_SERIALIZE_KEY) {
      const result = MultitailArrow.validateKetNode(
        node.data as KetFileMultitailArrowNode,
      );

      if (result !== null) {
        return { isValid: false, error: result };
      }
    }
  }

  return { isValid: true };
};
