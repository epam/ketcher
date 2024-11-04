import { Page, expect } from '@playwright/test';
import { Ketcher, MolfileFormat } from 'ketcher-core';
import { readFileContents, saveToFile } from './readFile';
import {
  getCdx,
  getCdxml,
  getKet,
  getMolfile,
  getSmarts,
} from '@utils/formats';

export enum FileType {
  KET = 'ket',
  CDX = 'cdx',
  CDXML = 'cdxml',
  SMARTS = 'smarts',
}

const fileTypeHandlers: { [key in FileType]: (page: Page) => Promise<string> } =
  {
    [FileType.KET]: getKet,
    [FileType.CDX]: getCdx,
    [FileType.CDXML]: getCdxml,
    [FileType.SMARTS]: getSmarts,
  };

export async function verifyFile(
  page: Page,
  filename: string,
  expectedFilename: string,
  fileType: FileType,
) {
  // line below for backward compatibility (to comply with prettier)
  // due to mistake - filename parameter was never make sence,
  // since we took the original "filename" file directly from the memory but not from file
  filename = '';

  verifyFile2(page, expectedFilename, fileType);
}

export async function verifyFile2(
  page: Page,
  expectedFilename: string,
  fileType: FileType,
) {
  const getFileContent = fileTypeHandlers[fileType];

  if (!getFileContent) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  // This two lines for creating from scratch or for updating exampled files
  const expectedFileContent = await getFileContent(page);
  await saveToFile(expectedFilename, expectedFileContent);

  // This line for filtering out example file content (named as fileExpected)
  // and file content from memory (named as file) from unnessusary data
  const { fileExpected, file } = await receiveFileComparisonData({
    page,
    expectedFileName: expectedFilename,
  });

  expect(file).toEqual(fileExpected);
}

export async function verifyMolfile(
  page: Page,
  format: 'v2000' | 'v3000',
  filename: string,
  expectedFilename: string,
  metaDataIndexes: number[] = [],
) {
  const expectedFile = await getMolfile(page, format);
  await saveToFile(filename, expectedFile);

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: expectedFilename,
      fileFormat: format,
      metaDataIndexes,
    });

  expect(molFile).toEqual(molFileExpected);
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
