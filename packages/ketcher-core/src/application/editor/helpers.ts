import { KetSerializer } from 'domain/serializers';
import { IKetMacromoleculesContent } from 'application/formatters';

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

export const getEmptyMonomersLibraryJson =
  function (): IKetMacromoleculesContent {
    // TODO fix types
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return {
      root: {
        templates: [],
        nodes: [],
        connections: [],
      },
    };
  };
