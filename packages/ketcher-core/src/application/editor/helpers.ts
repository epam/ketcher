import { KetSerializer } from 'domain/serializers';
import { IRnaPreset } from './tools';
import { AmbiguousMonomerType, MonomerOrAmbiguousType } from 'domain/types';

export const parseMonomersLibrary = (monomersDataRaw: string | JSON) => {
  const monomersLibraryParsedJson =
    typeof monomersDataRaw === 'string'
      ? JSON.parse(monomersDataRaw)
      : monomersDataRaw;
  const serializer = new KetSerializer();
  const monomersLibrary = serializer.convertMonomersLibrary(
    monomersLibraryParsedJson,
  );

  return { monomersLibraryParsedJson, monomersLibrary };
};

export const isLibraryItemRnaPreset = (
  item: IRnaPreset | MonomerOrAmbiguousType,
): item is IRnaPreset => {
  return 'sugar' in item;
};

export const isMonomerAmbiguous = (
  item: MonomerOrAmbiguousType,
): item is AmbiguousMonomerType => {
  return item.isAmbiguous === true;
};
