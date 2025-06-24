import { KetSerializer } from 'domain/serializers';

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
