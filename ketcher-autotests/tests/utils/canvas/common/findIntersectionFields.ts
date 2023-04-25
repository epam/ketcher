import { AtomAttributes, BondAttributes } from '@utils/canvas/types';
import { Atom, Bond } from 'ketcher-core';

export function findIntersectionFields(
  attributes: AtomAttributes | BondAttributes,
  structure: (Atom | Bond)[]
): (Atom | Bond)[] {
  let targets: (Atom | Bond)[] = [];
  let attributesLength = Object.keys(attributes).length;

  for (let item of structure) {
    let keysCounter = 0;
    for (let attr of Object.keys(attributes)) {
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
