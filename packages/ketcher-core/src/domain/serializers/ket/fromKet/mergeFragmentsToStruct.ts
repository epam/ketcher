import type { Struct } from 'domain/entities';
import { atomToStruct, bondToStruct } from './atomBondToStruct';
import type { KetItem } from './types';

export function mergeFragmentsToStruct(
  ketItem: KetItem,
  struct: Struct,
): Struct {
  let atomsOffset = 0;
  if (ketItem.fragments) {
    for (const fragment of ketItem.fragments) {
      for (const atom of fragment.atoms ?? []) {
        struct.atoms.add(atomToStruct(atom));
      }
      for (const bond of fragment.bonds ?? []) {
        struct.bonds.add(bondToStruct(bond, atomsOffset));
      }
      atomsOffset += fragment.atoms?.length ?? 0;
    }
  }
  return struct;
}
