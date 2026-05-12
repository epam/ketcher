import { KetSerializer } from 'domain/serializers';
import {
  IKetMacromoleculesContent,
  identifyStructFormat,
  SupportedFormat,
} from 'application/formatters';
import { ensureString, KetcherLogger } from 'utilities';

const SDF_RECORD_SEPARATOR = '$$$$';
const SDF_TAG_REGEX = /^>\s*<([^>]+)>\s*$/;

const extractSdfRecordFields = (record: string): Record<string, string> => {
  const fields: Record<string, string> = {};
  const lines = record.split(/\r?\n/);
  let currentTag: string | null = null;
  let currentValue: string[] = [];

  const flush = () => {
    if (currentTag !== null) {
      fields[currentTag] = currentValue.join('\n').trim();
    }
    currentTag = null;
    currentValue = [];
  };

  for (const line of lines) {
    const tagMatch = line.match(SDF_TAG_REGEX);
    if (tagMatch) {
      flush();
      currentTag = tagMatch[1].trim();
      continue;
    }
    if (currentTag !== null) {
      if (line.trim() === '') {
        flush();
      } else {
        currentValue.push(line);
      }
    }
  }

  flush();
  return fields;
};

export const validateMonomerGroupTemplatesInSdf = (
  rawMonomersData: string | JSON,
  params?: { format?: string },
): void => {
  const rawString = ensureString(rawMonomersData);
  const format = params?.format ?? identifyStructFormat(rawString);

  if (format !== SupportedFormat.sdf && format !== SupportedFormat.sdfV3000) {
    return;
  }

  const records = rawString
    .split(SDF_RECORD_SEPARATOR)
    .map((record) => record.trim())
    .filter((record) => record.length > 0);

  const errors: string[] = [];
  records.forEach((record, index) => {
    const fields = extractSdfRecordFields(record);
    if (fields.type !== 'monomerGroupTemplate') {
      return;
    }
    const groupName = fields.groupName?.trim();
    if (!groupName) {
      const errorMessage = `Ketcher::updateMonomersLibrary: Preset #${
        index + 1
      } "groupName" is mandatory for monomerGroupTemplate but is missing or empty. The preset was not added to the library.`;
      KetcherLogger.error(errorMessage);
      errors.push(errorMessage);
    }
  });

  if (errors.length > 0) {
    throw new Error(
      `Ketcher::updateMonomersLibrary: One or more presets were skipped during library update:\n  - ${errors.join(
        '\n  - ',
      )}`,
    );
  }
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
