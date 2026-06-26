import { KetSerializer } from 'domain/serializers';
import type {
  IKetMacromoleculesContent,
  IKetMacromoleculesContentRootProperty,
} from 'application/formatters';

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

export const getEmptyMonomersLibraryJson = (): IKetMacromoleculesContent => {
  const emptyMonomersLibraryJson: IKetMacromoleculesContentRootProperty = {
    root: {
      templates: [],
      nodes: [],
      connections: [],
    },
  };

  return emptyMonomersLibraryJson as IKetMacromoleculesContent;
};
