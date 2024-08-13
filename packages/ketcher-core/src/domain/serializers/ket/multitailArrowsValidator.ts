import { KetFileNode } from 'domain/serializers';
import { KetFileMultitailArrowNode } from 'domain/entities';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from 'domain/constants';

// Y coordinates are inverted during the validation
function validateKetFileMultitailArrowNode({
  head,
  spine,
  tails,
}: KetFileMultitailArrowNode): boolean {
  const [spineStart, spineEnd] = spine.pos;
  if (spineStart.x !== spineEnd.x || spineStart.y <= spineEnd.y) {
    return false;
  }
  const headPoint = head.position;
  if (
    headPoint.x <= spineStart.x ||
    headPoint.y <= spineEnd.y ||
    headPoint.y >= spineStart.y
  ) {
    return false;
  }
  const tailsPositions = [...tails.pos].sort((a, b) => b.y - a.y);

  if (
    tailsPositions.at(0)?.y !== spineStart.y ||
    tailsPositions.at(-1)?.y !== spineEnd.y
  ) {
    return false;
  }

  const firstTailX = tails.pos[0].x;
  if (firstTailX >= spineStart.x) {
    return false;
  }

  return tails.pos.every(
    (tail) =>
      tail.x === firstTailX && tail.y >= spineEnd.y && tail.y <= spineStart.y,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateMultitailArrows = (json: any): boolean => {
  const nodes: Array<KetFileNode<unknown | KetFileMultitailArrowNode>> =
    json.root.nodes;
  return nodes.every((node) => {
    return node.type === MULTITAIL_ARROW_SERIALIZE_KEY
      ? validateKetFileMultitailArrowNode(
          node.data as KetFileMultitailArrowNode,
        )
      : true;
  });
};
