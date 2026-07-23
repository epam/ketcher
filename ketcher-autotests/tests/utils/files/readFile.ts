/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';
import {
  clickInTheMiddleOfTheCanvas,
  clickOnCanvas,
  MacroFileType,
  StructureFormat,
  waitForRender,
  waitForSpinnerFinishedWork,
} from '@utils';
import { MolfileFormat } from 'ketcher-core';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import {
  PeptideLetterCodeType,
  SequenceMonomerType,
} from '@tests/pages/constants/monomers/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { waitForLoadAndRender } from '@utils/common/loaders/waitForLoad/waitForLoad';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { OpenPPTXFileDialog } from '@tests/pages/molecules/OpenPPTXFileDialog';
import { ImageBox, ImageBoxType } from '@tests/pages/common/canvas/ImageBox';
import { getImageLocator } from '@utils/canvas/image/getImageLocator';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';

export function getTestDataDirectory() {
  const projectRoot = path.resolve(__dirname, '../../..');
  const resolvedFilePath = path.resolve(projectRoot, 'tests/test-data');
  return resolvedFilePath;
}

function shouldGenerateData() {
  return (
    process.env.GENERATE_DATA === 'true' ||
    process.argv.some(
      (arg) =>
        arg === '--update-snapshots' || arg.startsWith('--update-snapshots='),
    )
  );
}

const BASE64_CDX_PREFIX = 'VmpDRDAxMDA';
const BASE64_TEXT_PATTERN = /^[A-Za-z0-9+/=\r\n]+$/;

type UploadFile =
  | string
  | {
      name: string;
      mimeType: string;
      buffer: Buffer;
    };

function normalizeBase64Content(content: string) {
  return content.replace(/\s+/g, '');
}

// Generated CDX snapshots may be stored as base64 text, while uploaded .cdx files
// must use raw binary bytes to match the app's file opener behavior.
function isBase64CdxSnapshot(content: string) {
  const normalizedContent = normalizeBase64Content(content);

  return (
    normalizedContent.length > 0 &&
    normalizedContent.length % 4 === 0 &&
    normalizedContent.startsWith(BASE64_CDX_PREFIX) &&
    BASE64_TEXT_PATTERN.test(normalizedContent)
  );
}

async function readCdxFileContent(filePath: string) {
  const fileBuffer = await fs.promises.readFile(filePath);
  const textContent = fileBuffer.toString('utf8');

  if (isBase64CdxSnapshot(textContent)) {
    return normalizeBase64Content(textContent);
  }

  return fileBuffer.toString('base64');
}

async function getUploadFile(filePath: string): Promise<UploadFile> {
  if (path.extname(filePath).toLowerCase() !== '.cdx') {
    return filePath;
  }

  const fileBuffer = await fs.promises.readFile(filePath);
  const textContent = fileBuffer.toString('utf8');

  if (!isBase64CdxSnapshot(textContent)) {
    return filePath;
  }

  return {
    name: path.basename(filePath),
    mimeType: 'chemical/x-cdx',
    buffer: Buffer.from(normalizeBase64Content(textContent), 'base64'),
  };
}

export async function readFileContent(filePath: string) {
  const testDataDirectory = getTestDataDirectory();
  const resolvedFilePath = path.resolve(testDataDirectory, filePath);

  if (path.extname(resolvedFilePath).toLowerCase() === '.cdx') {
    return await readCdxFileContent(resolvedFilePath);
  }

  return await fs.promises.readFile(resolvedFilePath, 'utf8');
}

export async function openFile(page: Page, filename: string) {
  const testDataDirectory = getTestDataDirectory();
  const resolvedFilePath = path.resolve(testDataDirectory, filename);
  const uploadFile = await getUploadFile(resolvedFilePath);
  // Start waiting for file chooser before clicking. Note no await.
  const fileChooserPromise = page.waitForEvent('filechooser');
  await OpenStructureDialog(page).openFromFile();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(uploadFile);
}

/**
 * Open file and put in center of canvas
 * Should be used to prevent extra delay() calls in test cases
 */
export async function openFileAndAddToCanvas(
  page: Page,
  filename: string,
  xOffsetFromCenter?: number,
  yOffsetFromCenter?: number,
) {
  await CommonTopLeftToolbar(page).openFile();
  await openFile(page, filename);

  await waitForLoadAndRender(page, async () => {
    await PasteFromClipboardDialog(page).addToCanvasButton.click();
  });

  // Needed for Micro mode
  if (
    typeof xOffsetFromCenter === 'number' &&
    typeof yOffsetFromCenter === 'number'
  ) {
    await clickOnCanvas(page, xOffsetFromCenter, yOffsetFromCenter, {
      from: 'pageCenter',
    });
  } else {
    await clickInTheMiddleOfTheCanvas(page);
  }
}

export async function openFileAndAddToCanvasMacro(
  page: Page,
  filename: string,
  structureFormat: StructureFormat = MacroFileType.KetFormat,
  errorMessageExpected = false,
) {
  await CommonTopLeftToolbar(page).openFile();
  await openFile(page, filename);
  await setupStructureFormatComboboxes(page, structureFormat);
  await PasteFromClipboardDialog(page).addToCanvas({
    errorMessageExpected,
  });
}

export async function openFileAndAddToCanvasAsNewProjectMacro(
  page: Page,
  filename: string,
  structureFormat: StructureFormat = MacroFileType.KetFormat,
  errorMessageExpected = false,
) {
  await CommonTopLeftToolbar(page).openFile();
  await openFile(page, filename);
  await setupStructureFormatComboboxes(page, structureFormat);
  await PasteFromClipboardDialog(page).openAsNew({
    errorMessageExpected,
  });
}

export async function openFileAndAddToCanvasAsNewProject(
  page: Page,
  filename: string,
  errorMessageExpected = false,
) {
  await CommonTopLeftToolbar(page).openFile();
  await openFile(page, filename);
  await PasteFromClipboardDialog(page).openAsNew({
    errorMessageExpected,
  });
}

export async function openImageAndAddToCanvas(
  page: Page,
  filename: string,
  x?: number,
  y?: number,
): Promise<ImageBoxType> {
  const testDataDirectory = getTestDataDirectory();
  const resolvedFilePath = path.resolve(testDataDirectory, filename);

  const fileChooserPromise = page.waitForEvent('filechooser');
  await CommonLeftToolbar(page).handTool();
  await LeftToolbar(page).image();

  if (x !== undefined && y !== undefined) {
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
  } else {
    await clickInTheMiddleOfTheCanvas(page);
  }

  await waitForRender(page, async () => {
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(resolvedFilePath);
  });

  if (!(await ErrorMessageDialog(page).isVisible())) {
    const imageBoxId = await getImageLocator(page, {}).evaluateAll(
      (elements) => {
        const ids = elements.map((element) =>
          Number(element.getAttribute('data-image-id')),
        );
        const validIds = ids.filter(Number.isFinite);
        return validIds.length > 0 ? Math.max(...validIds) : null;
      },
    );

    if (imageBoxId !== null) {
      return await ImageBox(page, getImageLocator(page, { id: imageBoxId }));
    }
  }
  return await ImageBox(page);
}

export async function openPPTXFileAndAddToCanvasAsNewProject(
  page: Page,
  filePath: string,
  numberOf: {
    Structure: number;
  } = { Structure: 1 },
) {
  await CommonTopLeftToolbar(page).openFile();
  await waitForSpinnerFinishedWork(page, async () => {
    await openFile(page, filePath);
  });
  if (numberOf.Structure !== 1) {
    await OpenPPTXFileDialog(page).selectStructure(numberOf);
  }
  await OpenPPTXFileDialog(page).pressOpenAsNewProjectButton();
}

export async function filteredFile(
  file: string,
  filteredIndex: number,
): Promise<string> {
  return file
    .split('\n')
    .filter((_str, index) => index > filteredIndex)
    .join('\n')
    .replace(/\s+/g, '');
}

export async function pasteFromClipboardAndAddToCanvas(
  page: Page,
  fillStructure: string,
  errorMessageExpected = false,
) {
  await CommonTopLeftToolbar(page).openFile();
  await OpenStructureDialog(page).pasteFromClipboard();
  await PasteFromClipboardDialog(page).fillTextArea(fillStructure);
  await PasteFromClipboardDialog(page).addToCanvas({
    errorMessageExpected,
  });
}

export async function pasteFromClipboardAndOpenAsNewProject(
  page: Page,
  fillStructure: string,
  errorMessageExpected = false,
) {
  await CommonTopLeftToolbar(page).openFile();
  await OpenStructureDialog(page).pasteFromClipboard();
  await PasteFromClipboardDialog(page).fillTextArea(fillStructure);
  await PasteFromClipboardDialog(page).openAsNew({
    errorMessageExpected,
  });
}

async function setupStructureFormatComboboxes(
  page: Page,
  structureFormat: StructureFormat,
) {
  let structureType;
  let sequenceOrFastaType: SequenceMonomerType = SequenceMonomerType.RNA;
  let peptideType: PeptideLetterCodeType = PeptideLetterCodeType.oneLetterCode;

  if (Array.isArray(structureFormat)) {
    const [tmpFastaOrSequenceStructureType, tmpSequenceOrFastaType] =
      structureFormat;
    structureType = tmpFastaOrSequenceStructureType;
    if (Array.isArray(tmpSequenceOrFastaType)) {
      const [tmpSequenceMonomerType, tmpPetideType] = tmpSequenceOrFastaType;
      sequenceOrFastaType = tmpSequenceMonomerType;
      peptideType = tmpPetideType;
    } else {
      sequenceOrFastaType = tmpSequenceOrFastaType;
    }
  } else {
    structureType = structureFormat;
  }
  if (structureFormat !== MacroFileType.KetFormat) {
    await PasteFromClipboardDialog(page).selectContentType(structureType);
  }

  if (
    structureType === MacroFileType.Sequence ||
    structureType === MacroFileType.FASTA
  ) {
    await PasteFromClipboardDialog(page).selectMonomerType(sequenceOrFastaType);

    if (
      sequenceOrFastaType === SequenceMonomerType.Peptide &&
      peptideType === PeptideLetterCodeType.threeLetterCode
    ) {
      await PasteFromClipboardDialog(page).selectPeptideLetterType(
        PeptideLetterCodeType.threeLetterCode,
      );
    }
  }
}

/**
 *  Usage examples:
 *  1. pasteFromClipboardAndAddToMacromoleculesCanvas(
 *    page,
 *    MacroFileType.KetFormat,
 *    'Some KET content',
 *  );
 *
 *  2. pasteFromClipboardAndAddToMacromoleculesCanvas(
 *    page,
 *    [MacroFileType.FASTA, SequenceMonomerType.DNA],
 *    'Some FASTA content of DNA type',
 *  );
 *  3. pasteFromClipboardAndAddToMacromoleculesCanvas(
 *    page,
 *    [MacroFileType.Sequence, SequenceMonomerType.RNA],
 *    'Some Sequence content of RNA type',
 *  );
 *  4. pasteFromClipboardAndAddToMacromoleculesCanvas(
 *    page,
 *    [MacroFileType.Sequence, [SequenceMonomerType.Peptide, PeptideLetterCodeType.threeLetterCode]],
 *    'Some Sequence content of Peptide type of 3-letter code',
 *  );
 *  5. pasteFromClipboardAndAddToMacromoleculesCanvas(
 *   page,
 *   MacroFileType.HELM,
 *   'Some HELM content of RNA type',
 *  );
 *
 * @param {Page} page - The Playwright page instance where the button is located.
 * @param {structureFormat} structureFormat - Content type from enum MacroFileType, if Sequence or FASTA - require array of [MacroFileType, SequenceMonomerType., if SequenceMonomerType.=== Peptide - requre [MacroFileType, [SequenceMonomerType, PeptideLetterCodeType]]
 * @param {fillStructure}  fillStructure - content to load on the canvas via "Paste from clipboard" way
 * @param {errorExpected}  errorMessageExpected - have to be true if you know if error should occure
 */
export async function pasteFromClipboardAndAddToMacromoleculesCanvas(
  page: Page,
  structureFormat: StructureFormat,
  fillStructure: string,
  errorMessageExpected = false,
) {
  await CommonTopLeftToolbar(page).openFile();
  await OpenStructureDialog(page).pasteFromClipboard();
  await setupStructureFormatComboboxes(page, structureFormat);
  await PasteFromClipboardDialog(page).fillTextArea(fillStructure);
  await PasteFromClipboardDialog(page).addToCanvas({ errorMessageExpected });
}

export async function pasteFromClipboardAndOpenAsNewProjectMacro(
  page: Page,
  structureFormat: StructureFormat,
  fillStructure: string,
  errorMessageExpected = false,
) {
  await CommonTopLeftToolbar(page).openFile();
  await OpenStructureDialog(page).pasteFromClipboard();
  await setupStructureFormatComboboxes(page, structureFormat);
  await PasteFromClipboardDialog(page).fillTextArea(fillStructure);
  await PasteFromClipboardDialog(page).openAsNew({ errorMessageExpected });
}

export async function receiveMolFileComparisonData(
  page: Page,
  metaDataIndexes: number[],
  expectedMolFileName: string,
  molFileType?: MolfileFormat,
) {
  const molFileExpected = fs
    .readFileSync(expectedMolFileName, 'utf8')
    .split('\n')
    .filter((_str, index) => !metaDataIndexes.includes(index));
  const molFile = (
    await page.evaluate(
      (fileType) => window.ketcher.getMolfile(fileType),
      molFileType,
    )
  )
    .split('\n')
    .filter((_str, index) => !metaDataIndexes.includes(index));

  return { molFileExpected, molFile };
}

// The function is used to save the structure that is placed in the center
// of canvas when opened. So when comparing files, the coordinates
// always match and there is no difference between the results when comparing.
export async function saveToFile(filename: string, data: string) {
  const testDataDirectory = getTestDataDirectory();
  const resolvedFilePath = path.resolve(testDataDirectory, filename);
  if (shouldGenerateData()) {
    await fs.promises.mkdir(path.dirname(resolvedFilePath), {
      recursive: true,
    });

    if (
      path.extname(resolvedFilePath).toLowerCase() === '.cdx' &&
      isBase64CdxSnapshot(data)
    ) {
      const binaryContent = Uint8Array.from(
        Buffer.from(normalizeBase64Content(data), 'base64'),
      );

      return await fs.promises.writeFile(resolvedFilePath, binaryContent);
    }

    return await fs.promises.writeFile(resolvedFilePath, data, 'utf-8');
  }
}

export async function copyContentToClipboard(page: Page, content: string) {
  await page.evaluate(async (content) => {
    await navigator.clipboard.writeText(content);
  }, content);
}
