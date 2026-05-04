import {
  MultitailArrow,
  KetFileMultitailArrowNode,
} from 'domain/entities/multitailArrow';
import { Struct } from 'domain/entities/struct';
import { KetFileNode } from 'domain/serializers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function multitailArrowToStruct(ketItem: any, struct: Struct) {
  struct.addMultitailArrow(MultitailArrow.fromKetNode(ketItem));
  return struct;
}
