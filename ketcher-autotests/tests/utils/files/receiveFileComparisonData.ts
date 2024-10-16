import { Page, expect } from '@playwright/test';
import { Ketcher, MolfileFormat } from 'ketcher-core';
import { readFileContents, saveToFile } from './readFile';
import { getCdx, getCdxml, getKet } from '@utils/formats';

export enum FileType {
  KET = 'ket',
  CDX = 'cdx',
  CDXML = 'cdxml',
}

const fileTypeHandlers: { [key in FileType]: (page: Page) => Promise<string> } =
  {
    [FileType.KET]: getKet,
    [FileType.CDX]: getCdx,
    [FileType.CDXML]: getCdxml,
  };

export async function verifyFile(
  page: Page,
  filename: string,
  expectedFilename: string,
  fileType: FileType,
) {
  const getFileContent = fileTypeHandlers[fileType];

  if (!getFileContent) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  const expectedFile = await getFileContent(page);
  await saveToFile(filename, expectedFile);

  const { fileExpected, file } = await receiveFileComparisonData({
    page,
    expectedFileName: expectedFilename,
  });

  expect(file).toEqual(fileExpected);
}

const GetFileMethod: Record<string, keyof Ketcher> = {
  mol: 'getMolfile',
  rxn: 'getRxn',
  ket: 'getKet',
  smi: 'getSmiles',
  smarts: 'getSmarts',
  // TODO fix types of Ketcher. There are no getCDX and getCDXml functions
  // dirty hack to make it works
  cdx: 'getCDX' as keyof Ketcher,
  // dirty hack to make it works
  cdxml: 'getCDXml' as keyof Ketcher,
  cml: 'getCml',
  inchi: 'getInchi',
  sdf: 'getSdf',
  fasta: 'getFasta',
  seq: 'getSequence',
  idt: 'getIdt',
} as const;

type KetcherApiFunction = (format?: string) => Promise<string>;

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
  const fileExtension = fileName.split('.').pop();

  const methodName =
    fileExtension && fileExtension in GetFileMethod
      ? GetFileMethod[fileExtension as keyof typeof GetFileMethod]
      : GetFileMethod.ket;

  const pageData = {
    format: fileFormat,
    method: methodName,
  };

  await page.waitForFunction(() => window.ketcher);
  const file = await page.evaluate(
    ({ method, format }) =>
      (window.ketcher[method] as KetcherApiFunction)(format),
    pageData,
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
  const fileExpected = (await readFileContents(expectedFileName)).split('\n');

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
