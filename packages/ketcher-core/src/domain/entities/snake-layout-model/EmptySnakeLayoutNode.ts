export interface IEmptySnakeLayoutNode {
  readonly __emptySnakeLayoutNode: true;
}

export const EmptySnakeLayoutNode: IEmptySnakeLayoutNode = {
  __emptySnakeLayoutNode: true,
} as const;

export function isEmptySnakeLayoutNode(
  node: unknown,
): node is IEmptySnakeLayoutNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    '__emptySnakeLayoutNode' in node &&
    (node as IEmptySnakeLayoutNode).__emptySnakeLayoutNode === true
  );
}
