import type {
  AmbiguousMonomerType,
  MonomerOrAmbiguousType,
} from 'ketcher-core';

export const isAmbiguousMonomerLibraryItem = (
  monomer?: MonomerOrAmbiguousType,
): monomer is AmbiguousMonomerType => Boolean(monomer?.isAmbiguous);
