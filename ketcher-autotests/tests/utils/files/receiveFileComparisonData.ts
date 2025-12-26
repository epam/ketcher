import * as path from 'path';
import { Page, expect } from '@playwright/test';
import { Ketcher } from 'ketcher-core';
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
  getExtendedSmiles,
  FileFormat,
} from '@utils/formats';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { takeElementScreenshot } from '@utils/canvas/helpers';

export enum FileType {
  KET = 'ket',
  CDX = 'cdx',
  CDXML = 'cdxml',
  SMARTS = 'smarts',
  SMILES = 'smi',
  ExtendedSMILES = 'cxsmi',
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
  | ((page: Page, fileFormat?: FileFormat) => Promise<string>);

const fileTypeHandlers: { [key in FileType]: FileTypeHandler } = {
  [FileType.KET]: getKet,
  [FileType.CDX]: getCdx,
  [FileType.CDXML]: getCdxml,
  [FileType.SMARTS]: getSmarts,
  [FileType.SMILES]: getSmiles,
  [FileType.ExtendedSMILES]: getExtendedSmiles,
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
  fileFormat?: FileFormat,
): Promise<string> {
  const handler = fileTypeHandlers[fileType];

  if (!handler) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  // If fileFormat is provided ('v2000' or 'v3000'), pass it to the handler
  return fileFormat ? handler(page, fileFormat) : handler(page);
}

export async function verifyFileExport(
  page: Page,
  expectedFilename: string,
  fileType: FileType,
  format?: FileFormat,
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
          !line.includes('$MDL') &&
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

export async function verifyConsoleExport(
  consoleContent: string,
  expectedFilename: string,
  metaDataIndexes: number[] = [],
) {
  const testDataDir = getTestDataDirectory();
  const resolvedExpectedFilename = path.resolve(testDataDir, expectedFilename);

  // This two lines for creating from scratch or for updating exampled files
  // const expectedFileContent = await getFileContent(page, fileType, format);
  await saveToFile(resolvedExpectedFilename, consoleContent);
  // This line for filtering out example file content (named as fileExpected)
  // and file content from memory (named as file) from unnessusary data
  const fileExpected = (await readFileContent(expectedFilename)).split('\n');

  // Function to filter lines
  const filterLines = (lines: string[], indexes: number[]) => {
    if (indexes.length === 0) {
      // Default behavior: ignore lines containing '-INDIGO-', 'Ketcher' and '$DATM'
      return lines.filter(
        (line) =>
          !line.includes('-INDIGO-') &&
          !line.includes('$DATM') &&
          !line.includes('$MDL') &&
          !line.includes('Ketcher'),
      );
    }
    // If indexes are specified, filter lines by indexes
    return filterByIndexes(lines, indexes);
  };
  const filteredConsoleContent = filterLines(
    consoleContent.split('\n'),
    metaDataIndexes,
  );
  const filteredFileExpected = filterLines(fileExpected, metaDataIndexes);
  // Compare the filtered files
  expect(filteredConsoleContent).toEqual(filteredFileExpected);
}

const GetFileMethod: Record<string, keyof Ketcher> = {
  mol: 'getMolfile',
  rxn: 'getRxn',
  ket: 'getKet',
  smi: 'getSmiles',
  cxsmi: 'getExtendedSmiles' as keyof Ketcher,
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
  fileFormat?: FileFormat;
}): Promise<string[]> {
  const fileExtension = fileName.split('.').pop();

  const methodName =
    fileExtension && fileExtension in GetFileMethod
      ? GetFileMethod[fileExtension]
      : GetFileMethod.ket;

  const pageData = fileFormat
    ? { method: methodName, format: fileFormat }
    : { method: methodName };

  await page.waitForFunction(() => window.ketcher);

  const file = await page.evaluate(({ method, format }) => {
    return format ? window.ketcher[method](format) : window.ketcher[method]();
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
  fileFormat?: FileFormat;
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
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.HELM,
  );
  const HELMExportResult = await SaveStructureDialog(page).getTextAreaValue();

  expect(HELMExportResult).toEqual(HELMExportExpected);

  await SaveStructureDialog(page).cancel();
}

export async function verifyAxoLabsExport(
  page: Page,
  AxoLabsExportExpected = '',
) {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.AxoLabs,
  );
  const AxoLabsExportResult = await SaveStructureDialog(
    page,
  ).getTextAreaValue();

  expect(AxoLabsExportResult).toEqual(AxoLabsExportExpected);

  await SaveStructureDialog(page).cancel();
}

export async function verifyPNGExport(page: Page) {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.PNGImage,
  );
  await takeElementScreenshot(
    page,
    SaveStructureDialog(page).saveStructureTextarea,
  );
  await SaveStructureDialog(page).cancel();
}

export async function verifySVGExport(page: Page) {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.SVGDocument,
  );
  await takeElementScreenshot(
    page,
    SaveStructureDialog(page).saveStructureTextarea,
  );
  await SaveStructureDialog(page).cancel();
}

export async function verifyFASTAExport(page: Page, FASTAExportExpected = '') {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.FASTA,
  );
  const FASTAExportResult = await SaveStructureDialog(page).getTextAreaValue();

  expect(FASTAExportResult).toEqual(FASTAExportExpected);

  await SaveStructureDialog(page).cancel();
}

export async function verifySequence1LetterCodeExport(
  page: Page,
  Sequence1LetterCodeExportExpected = '',
) {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.Sequence1LetterCode,
  );
  const Sequence1LetterCodeExportResult = await SaveStructureDialog(
    page,
  ).getTextAreaValue();

  expect(Sequence1LetterCodeExportResult).toEqual(
    Sequence1LetterCodeExportExpected,
  );

  await SaveStructureDialog(page).cancel();
}

export async function verifyIDTExport(page: Page, IDTExportExpected = '') {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.IDT,
  );
  const IDTExportResult = await SaveStructureDialog(page).getTextAreaValue();

  expect(IDTExportResult).toEqual(IDTExportExpected);

  await SaveStructureDialog(page).cancel();
}

export async function verifySMILESExport(
  page: Page,
  SMILESExportExpected = '',
) {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.DaylightSMILES,
  );
  await expect(SaveStructureDialog(page).saveStructureTextarea).toHaveValue(
    SMILESExportExpected,
  );
  await SaveStructureDialog(page).closeWindow();
}

export async function verifySMARTSExport(
  page: Page,
  SMARTSExportExpected = '',
) {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.DaylightSMARTS,
  );
  await expect(SaveStructureDialog(page).saveStructureTextarea).toHaveValue(
    SMARTSExportExpected,
  );
  await SaveStructureDialog(page).closeWindow();
}

export async function verifySMARTSExportWarnings(page: Page) {
  const value =
    'Structure contains query properties of atoms and bonds that are not supported in the SMARTS. Query properties will not be reflected in the file saved.';
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.DaylightSMARTS,
  );
  await SaveStructureDialog(page).switchToWarningsTab();
  const warningSmartsTextArea = SaveStructureDialog(
    page,
  ).warningTextarea.filter({ hasText: 'SMARTS' });
  const warningText = await warningSmartsTextArea.evaluate(
    (node) => node.textContent,
  );
  expect(warningText).toEqual(value);
  await SaveStructureDialog(page).closeWindow();
}

export async function verifyInChIKeyExport(
  page: Page,
  InChIKeyExportExpected = '',
) {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.InChIKey,
  );
  const InChIKeyExportResult = await SaveStructureDialog(
    page,
  ).getTextAreaValue();

  expect(InChIKeyExportResult).toEqual(InChIKeyExportExpected);

  await SaveStructureDialog(page).cancel();
}
