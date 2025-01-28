import { Page, expect } from '@playwright/test';
import { Ketcher, MolfileFormat } from 'ketcher-core';
import { readFileContents, saveToFile } from './readFile';
import {
  getCdx,
  getCdxml,
  getCml,
  getKet,
  getMolfile,
  getRdf,
  getRxn,
  getSdf,
  getSmarts,
} from '@utils/formats';
import { selectSaveTool } from '@utils/canvas';
import { pressButton } from '@utils/clicks';
import { chooseFileFormat } from '@utils/macromolecules';

export enum FileType {
  KET = 'ket',
  CDX = 'cdx',
  CDXML = 'cdxml',
  SMARTS = 'smarts',
  MOL = 'mol',
  RXN = 'rxn',
  CML = 'cml',
  SDF = 'sdf',
}

type FileTypeHandler =
  | ((page: Page) => Promise<string>)
  | ((page: Page, fileFormat?: MolfileFormat) => Promise<string>);

const fileTypeHandlers: { [key in FileType]: FileTypeHandler } = {
  [FileType.KET]: getKet,
  [FileType.CDX]: getCdx,
  [FileType.CDXML]: getCdxml,
  [FileType.SMARTS]: getSmarts,
  [FileType.MOL]: getMolfile,
  [FileType.RXN]: getRxn,
  [FileType.CML]: getCml,
  [FileType.SDF]: getSdf,
};

async function getFileContent(
  page: Page,
  fileType: FileType,
  fileFormat?: MolfileFormat,
): Promise<string> {
  const handler = fileTypeHandlers[fileType];

  if (!handler) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  // For MOL and RXN files, handle the format explicitly
  if (fileType === FileType.MOL || fileType === FileType.RXN) {
    if (fileFormat === 'v2000' || fileFormat === undefined) {
      // If 'v2000' is explicitly requested or format is not provided, call the handler without format argument
      return (handler as (page: Page) => Promise<string>)(page);
    }
    // If format is explicitly provided (like 'v3000'), pass it to the handler
    return (
      handler as (page: Page, fileFormat?: MolfileFormat) => Promise<string>
    )(page, fileFormat);
  }

  // Default behavior for other file types
  return (handler as (page: Page) => Promise<string>)(page);
}

export async function verifyFileExport(
  page: Page,
  expectedFilename: string,
  fileType: FileType,
  format: MolfileFormat = 'v2000',
  metaDataIndexes: number[] = [],
) {
  // This two lines for creating from scratch or for updating exampled files
  const expectedFileContent = await getFileContent(page, fileType, format);
  await saveToFile(expectedFilename, expectedFileContent);
  // This line for filtering out example file content (named as fileExpected)
  // and file content from memory (named as file) from unnessusary data
  const { fileExpected, file } = await receiveFileComparisonData({
    page,
    expectedFileName: `tests/test-data/${expectedFilename}`,
    fileFormat: format,
    metaDataIndexes,
  });
  // Function to filter lines
  const filterLines = (lines: string[], indexes: number[]) => {
    if (indexes.length === 0) {
      // Default behavior: ignore lines containing '-INDIGO-' and '$DATM'
      return lines.filter(
        (line) => !line.includes('-INDIGO-') && !line.includes('$DATM'),
      );
    }
    // If indexes are specified, filter lines by indexes
    return filterByIndexes(lines, indexes);
  };
  // Apply filtering to both files
  const filteredFile = filterLines(file, metaDataIndexes);
  const filteredFileExpected = filterLines(fileExpected, metaDataIndexes);
  // Compare the filtered files
  expect(filteredFile).toEqual(filteredFileExpected);
}

export async function verifyRdfFile(
  page: Page,
  format: 'v2000' | 'v3000',
  filename: string,
  expectedFilename: string,
  metaDataIndexes: number[] = [],
) {
  const expectedFile = await getRdf(page, format);
  await saveToFile(filename, expectedFile);

  const { fileExpected: rdfFileExpected, file: rdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: expectedFilename,
      fileFormat: format,
      metaDataIndexes,
    });

  const filterLines = (lines: string[], indexes: number[]) => {
    if (indexes.length === 0) {
      return lines.filter(
        (line) => !line.includes('-INDIGO-') && !line.includes('$DATM'),
      );
    }
    return filterByIndexes(lines, indexes);
  };

  const filteredRdfFile = filterLines(rdfFile, metaDataIndexes);
  const filteredRdfFileExpected = filterLines(rdfFileExpected, metaDataIndexes);

  expect(filteredRdfFile).toEqual(filteredRdfFileExpected);
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
  sdf: 'getSdf' as keyof Ketcher,
  fasta: 'getFasta' as keyof Ketcher,
  seq: 'getSequence' as keyof Ketcher,
  idt: 'getIdt' as keyof Ketcher,
  rdf: 'getRdf' as keyof Ketcher,
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

  const pageData =
    fileFormat === 'v2000'
      ? { method: methodName }
      : { format: fileFormat, method: methodName };

  await page.waitForFunction(() => window.ketcher);
  const file = await page.evaluate(
    ({ method, format }) =>
      format
        ? (window.ketcher[method] as KetcherApiFunction)(format)
        : (window.ketcher[method] as KetcherApiFunction)(),
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
export async function verifyHELMExport(page: Page, HELMExportExpected = '') {
  await selectSaveTool(page);
  await chooseFileFormat(page, 'HELM');
  const HELMExportResult = await page
    .getByTestId('preview-area-text')
    .textContent();

  expect(HELMExportResult).toEqual(HELMExportExpected);

  await pressButton(page, 'Cancel');
}
