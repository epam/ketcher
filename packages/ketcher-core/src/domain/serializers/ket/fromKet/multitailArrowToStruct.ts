import { Struct } from 'domain/entities/struct';
import { MultitailArrow } from 'domain/entities/multitailArrow';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function multitailArrowToStruct(ketItem: any, struct: Struct) {
  struct.multitailArrows.add(MultitailArrow.fromKetNode(ketItem));
  return struct;
}
