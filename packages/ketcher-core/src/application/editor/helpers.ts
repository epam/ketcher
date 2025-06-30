import { KetSerializer } from 'domain/serializers';

export const parseMonomersLibrary = (
  monomersDataRaw: string | JSON,
  coreEditorId: string,
) => {
  const monomersLibraryParsedJson =
    typeof monomersDataRaw === 'string'
      ? JSON.parse(monomersDataRaw)
      : monomersDataRaw;
  const serializer = new KetSerializer(coreEditorId);
  const monomersLibrary = serializer.convertMonomersLibrary(
    monomersLibraryParsedJson,
  );

  return { monomersLibraryParsedJson, monomersLibrary };
};
