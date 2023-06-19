import * as fs from 'fs';
import { Page } from '@playwright/test';
import { MolfileFormat } from 'ketcher-core';

enum GetFileMethod {
  'mol' = 'getMolfile',
  'rxn' = 'getRxn',
  'ket' = 'getKet',
  'smi' = 'getSmiles',
  'smarts' = 'getSmarts',
  'cdx' = 'getCDX',
  'cdxml' = 'getCDXml',
  'cml' = 'getCml',
  'inchi' = 'getInchi',
}

type ketcherApiFunction = (format?: string) => Promise<string>;

function filterByIndexes(file: string[], indexes?: number[]): string[] {
  if (!indexes) {
    return file;
  }

  return file.filter((_str, index) => !indexes.includes(index));
}

async function receiveFile({
  page,
  fileName,
  fileFormat,
}: {
  page: Page;
  fileName: string;
  fileFormat?: MolfileFormat;
}): Promise<string[]> {
  const fileExtention = fileName.split('.').pop();

  const methodName =
    fileExtention && fileExtention in GetFileMethod
      ? GetFileMethod[fileExtention as keyof typeof GetFileMethod]
      : GetFileMethod.ket;

  const pageData = {
    format: fileFormat,
    method: methodName,
  };

  const file = await page.evaluate(
    ({ method, format }) =>
      (window.ketcher[method] as ketcherApiFunction)(format),
    pageData
  );

  return file.split('\n');
}

/**
 * Returns file and expected file
 * Usage: for comparison files in tests
 *
 * @param page - required, playwright page object
 * @param expectedFileName - required, path to a file, file name must contain file extension (.mol, .rxn, etc.)
 * @param metaDataIndexes - metadata strings indexes
 * @param fileFormat - optional, v2000 / v3000
 *
 * Based on file extension the function calculates method for getting a file.
 * If no file extension in GetFileMethod enum, getKet method will be used.
 * @see GetFileMethod
 */
export async function receiveFileComparisonData({
  page,
  expectedFileName,
  metaDataIndexes,
  fileFormat,
}: {
  page: Page;
  expectedFileName: string;
  metaDataIndexes?: number[];
  fileFormat?: MolfileFormat;
}): Promise<{
  file: string[];
  fileExpected: string[];
}> {
  const fileExpected = fs.readFileSync(expectedFileName, 'utf8').split('\n');

  const file = await receiveFile({
    page,
    fileName: expectedFileName,
    fileFormat,
  });

  return {
    file: filterByIndexes(file, metaDataIndexes),
    fileExpected: filterByIndexes(fileExpected, metaDataIndexes),
  };
}
