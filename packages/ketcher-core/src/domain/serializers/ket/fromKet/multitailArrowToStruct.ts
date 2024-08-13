import { Struct, MultitailArrow } from 'domain/entities';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function multitailArrowToStruct(ketItem: any, struct: Struct) {
  struct.multitailArrows.add(MultitailArrow.fromKetNode(ketItem));
  return struct;
}
