import { AtomAttributes, BondAttributes } from '@utils/canvas/types';
import { Atom, Bond } from 'ketcher-core';

export function findIntersectionFields(
  attributes: AtomAttributes | BondAttributes,
  structure: (Atom | Bond)[]
): (Atom | Bond)[] {
  const targets: (Atom | Bond)[] = [];
  const attributesLength = Object.keys(attributes).length;

  for (const item of structure) {
    let keysCounter = 0;
    for (const attr of Object.keys(attributes)) {
      // TODO find a solution for typing properly the next line
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (item[attr] === attributes[attr]) {
        keysCounter++;
      }

      if (attributesLength === keysCounter) {
        targets.push(item);
        break;
      }
    }
  }

  return targets;
}
