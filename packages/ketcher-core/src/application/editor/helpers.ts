import { KetSerializer } from 'domain/serializers';
import type {
  IKetMacromoleculesContent,
  IKetMacromoleculesContentRootProperty,
} from 'application/formatters';
import { MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH } from 'utilities';

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

export enum MonomerNameValidationErrorType {
  Empty = 'empty',
  TooLong = 'tooLong',
  InvalidCharacters = 'invalidCharacters',
}

export type MonomerNameValidationResult =
  | { isValid: true }
  | { isValid: false; error: MonomerNameValidationErrorType };

const MONOMER_NAME_ALLOWED_CHARACTERS_REGEXP = /^[A-Za-z0-9_*-]+$/;

export const validateMonomerName = (
  monomerName: string,
): MonomerNameValidationResult => {
  if (!monomerName?.trim()) {
    return { isValid: false, error: MonomerNameValidationErrorType.Empty };
  }

  if (monomerName.length > MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH) {
    return { isValid: false, error: MonomerNameValidationErrorType.TooLong };
  }

  if (!MONOMER_NAME_ALLOWED_CHARACTERS_REGEXP.test(monomerName)) {
    return {
      isValid: false,
      error: MonomerNameValidationErrorType.InvalidCharacters,
    };
  }

  return { isValid: true };
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
