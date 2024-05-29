import { Struct } from 'domain/entities';
import { atomToStruct, bondToStruct } from './moleculeToStruct';
import { KetItem } from './types';

export function mergeFragmentsToStruct(
  ketItem: KetItem,
  struct: Struct,
): Struct {
  let atomsOffset = 0;
  if (ketItem.fragments) {
    ketItem.fragments.forEach((fragment) => {
      fragment.atoms?.forEach((atom) => struct.atoms.add(atomToStruct(atom)));
      fragment.bonds?.forEach((bond) =>
        struct.bonds.add(bondToStruct(bond, atomsOffset)),
      );
      atomsOffset += fragment.atoms?.length || 0;
    });
  }
  return struct;
}
