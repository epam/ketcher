import * as path from 'path';
import { Page, expect } from '@playwright/test';
import { Ketcher, MolfileFormat } from 'ketcher-core';
import { getTestDataDirectory, readFileContent, saveToFile } from './readFile';
import {
  getCdx,
  getCdxml,
  getCml,
  getIdt,
  getInchi,
  getKet,
  getMolfile,
  getRdf,
  getRxn,
  getSdf,
  getSmarts,
  getSequence,
  getSmiles,
  getFasta,
} from '@utils/formats';
import { selectSaveTool } from '@tests/pages/common/TopLeftToolbar';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import {
  chooseFileFormat,
  saveStructureDialog,
} from '@tests/pages/common/SaveStructureDialog';

export enum FileType {
  KET = 'ket',
  CDX = 'cdx',
  CDXML = 'cdxml',
  SMARTS = 'smarts',
  SMILES = 'smi',
  MOL = 'mol',
  RXN = 'rxn',
  CML = 'cml',
  SDF = 'sdf',
  InChI = 'inchi',
  RDF = 'rdf',
  IDT = 'idt',
  SEQ = 'seq',
  FASTA = 'fasta',
}

type FileTypeHandler =
  | ((page: Page) => Promise<string>)
  | ((page: Page, fileFormat?: MolfileFormat) => Promise<string>);

const fileTypeHandlers: { [key in FileType]: FileTypeHandler } = {
  [FileType.KET]: getKet,
  [FileType.CDX]: getCdx,
  [FileType.CDXML]: getCdxml,
  [FileType.SMARTS]: getSmarts,
  [FileType.SMILES]: getSmiles,
  [FileType.MOL]: getMolfile,
  [FileType.RXN]: getRxn,
  [FileType.RDF]: getRdf,
  [FileType.CML]: getCml,
  [FileType.SDF]: getSdf,
  [FileType.InChI]: getInchi,
  [FileType.IDT]: getIdt,
  [FileType.SEQ]: getSequence,
  [FileType.FASTA]: getFasta,
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

  // If fileFormat is provided ('v2000' or 'v3000'), pass it to the handler
  return fileFormat
    ? (handler as (page: Page, fileFormat: MolfileFormat) => Promise<string>)(
        page,
        fileFormat,
      )
    : (handler as (page: Page) => Promise<string>)(page);
}

export async function verifyFileExport(
  page: Page,
  expectedFilename: string,
  fileType: FileType,
  format?: MolfileFormat,
  metaDataIndexes: number[] = [],
) {
  const testDataDir = getTestDataDirectory();
  const resolvedExpectedFilename = path.resolve(testDataDir, expectedFilename);

  // This two lines for creating from scratch or for updating exampled files
  const expectedFileContent = await getFileContent(page, fileType, format);
  await saveToFile(resolvedExpectedFilename, expectedFileContent);
  // This line for filtering out example file content (named as fileExpected)
  // and file content from memory (named as file) from unnessusary data
  const { fileExpected, file } = await receiveFileComparisonData({
    page,
    expectedFileName: resolvedExpectedFilename,
    fileFormat: format,
    metaDataIndexes,
  });
  // Function to filter lines
  const filterLines = (lines: string[], indexes: number[]) => {
    if (indexes.length === 0) {
      // Default behavior: ignore lines containing '-INDIGO-', 'Ketcher' and '$DATM'
      return lines.filter(
        (line) =>
          !line.includes('-INDIGO-') &&
          !line.includes('$DATM') &&
          !line.includes('Ketcher'),
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

  const pageData = fileFormat
    ? { method: methodName, format: fileFormat }
    : { method: methodName };

  await page.waitForFunction(() => window.ketcher);

  const file = await page.evaluate(({ method, format }) => {
    return format
      ? (window.ketcher[method] as KetcherApiFunction)(format)
      : (window.ketcher[method] as KetcherApiFunction)();
  }, pageData);

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
  const fileExpected = (await readFileContent(expectedFileName)).split('\n');

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
  const saveStructureTextarea = saveStructureDialog(page).saveStructureTextarea;
  const cancelButton = saveStructureDialog(page).cancelButton;

  await selectSaveTool(page);
  await chooseFileFormat(page, MacromoleculesFileFormatType.HELM);
  const HELMExportResult = saveStructureTextarea.textContent();

  expect(HELMExportResult).toEqual(HELMExportExpected);

  await cancelButton.click();
}
