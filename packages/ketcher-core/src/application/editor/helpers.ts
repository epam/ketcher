import { ketcherProvider } from 'application/utils';
import { BaseMode } from './modes/BaseMode';
import {
  DEFAULT_LAYOUT_MODE,
  HAS_CONTENT_LAYOUT_MODE,
  modesMap,
} from './modes';
import { KetSerializer } from 'domain/serializers';

export const initializeMode = (mode?: BaseMode): BaseMode => {
  if (mode) {
    return mode;
  }
  const ketcher = ketcherProvider.getKetcher();
  const isBlank = ketcher?.editor?.struct().isBlank();
  if (isBlank) {
    return new modesMap[DEFAULT_LAYOUT_MODE]();
  }
  return new modesMap[HAS_CONTENT_LAYOUT_MODE]();
};

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
