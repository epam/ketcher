/* eslint-disable max-len */
import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  clickOnTheCanvas,
  selectImageTool,
  clickOnCanvas,
  MacroFileType,
  delay,
} from '@utils';
import { waitForLoad } from '@utils/common';
import { MolfileFormat } from 'ketcher-core';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import {
  PeptideLetterCodeType,
  SequenceMonomerType,
} from '@tests/pages/constants/monomers/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';

export function getTestDataDirectory() {
  const projectRoot = path.resolve(__dirname, '../../..');
  const resolvedFilePath = path.resolve(projectRoot, 'tests/test-data');
  return resolvedFilePath;
}

export async function readFileContent(filePath: string) {
  const testDataDirectory = getTestDataDirectory();
  const resolvedFilePath = path.resolve(testDataDirectory, filePath);
  return fs.promises.readFile(resolvedFilePath, 'utf8');
}

export async function openFile(filename: string, page: Page) {
  const testDataDirectory = getTestDataDirectory();
  const resolvedFilePath = path.resolve(testDataDirectory, filename);
  // Start waiting for file chooser before clicking. Note no await.
  const fileChooserPromise = page.waitForEvent('filechooser');
  await OpenStructureDialog(page).openFromFile();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(resolvedFilePath);
}

export async function selectOptionInDropdown(filename: string, page: Page) {
  const options = {
    mol: 'MDL Molfile V3000',
    fasta: 'FASTA',
    seq: 'Sequence',
  };
  const extention = filename.split('.')[1] as keyof typeof options;
  const optionText = options[extention];
  const contentTypeSelector =
    PasteFromClipboardDialog(page).contentTypeSelector;
  const selectorExists = await contentTypeSelector.isVisible();

  if (
    selectorExists &&
    extention &&
    optionText &&
    extention !== ('ket' as string)
  ) {
    const selectorText = (await contentTypeSelector.innerText()).replace(
      /(\r\n|\n|\r)/gm,
      '',
    );
    await contentTypeSelector.getByText(selectorText).click();
    const option = page.getByRole('option');
    await option.getByText(optionText).click();
    // to stabilize the test
    await contentTypeSelector.getByRole('combobox').allInnerTexts();
  }
}

/**
 * Open file and put in center of canvas
 * Should be used to prevent extra delay() calls in test cases
 */
export async function openFileAndAddToCanvas(
  filename: string,
  page: Page,
  xOffsetFromCenter?: number,
  yOffsetFromCenter?: number,
) {
  await TopLeftToolbar(page).openFile();
  await openFile(filename, page);

  // to stabilize the test
  await selectOptionInDropdown(filename, page);

  await waitForLoad(page, async () => {
    await PasteFromClipboardDialog(page).addToCanvasButton.click();
  });

  // Needed for Micro mode
  if (
    typeof xOffsetFromCenter === 'number' &&
    typeof yOffsetFromCenter === 'number'
  ) {
    await clickOnTheCanvas(page, xOffsetFromCenter, yOffsetFromCenter);
  } else {
    await clickInTheMiddleOfTheScreen(page);
  }
}

export async function openFileAndAddToCanvasMacro(
  filename: string,
  page: Page,
  typeDropdownOption?: SequenceMonomerType,
  errorExpected = false,
) {
  await TopLeftToolbar(page).openFile();
  await openFile(filename, page);

  // to stabilize the test
  await selectOptionInDropdown(filename, page);

  if (typeDropdownOption) {
    await PasteFromClipboardDialog(page).selectMonomerType(typeDropdownOption);
  }
  if (!errorExpected) {
    await waitForLoad(page, async () => {
      await PasteFromClipboardDialog(page).addToCanvasButton.click();
    });
  } else {
    await PasteFromClipboardDialog(page).addToCanvasButton.click();
  }
}

export async function openFileAndAddToCanvasAsNewProjectMacro(
  filename: string,
  page: Page,
  typeDropdownOption?: SequenceMonomerType,
  errorExpected = false,
) {
  const openAsNewButton = PasteFromClipboardDialog(page).openAsNewButton;

  await TopLeftToolbar(page).openFile();
  await openFile(filename, page);

  // to stabilize the test
  await selectOptionInDropdown(filename, page);

  if (typeDropdownOption) {
    await PasteFromClipboardDialog(page).selectMonomerType(typeDropdownOption);
  }

  if (!errorExpected) {
    await waitForLoad(page, async () => {
      await openAsNewButton.click();
    });
  } else {
    await openAsNewButton.click();
  }
}

export async function openFileAndAddToCanvasAsNewProject(
  filename: string,
  page: Page,
  errorExpected = false,
) {
  await TopLeftToolbar(page).openFile();
  await openFile(filename, page);

  await selectOptionInDropdown(filename, page);

  if (!errorExpected) {
    await waitForLoad(page, async () => {
      await PasteFromClipboardDialog(page).openAsNewButton.click();
    });
  } else {
    await PasteFromClipboardDialog(page).openAsNewButton.click();
  }
}

export async function openImageAndAddToCanvas(
  filename: string,
  page: Page,
  x?: number,
  y?: number,
) {
  const testDataDirectory = getTestDataDirectory();
  const resolvedFilePath = path.resolve(testDataDirectory, filename);
  const debugDelay = 0.15;

  const fileChooserPromise = page.waitForEvent('filechooser');
  await delay(debugDelay);
  await CommonLeftToolbar(page).selectHandTool();
  await selectImageTool(page);

  if (x !== undefined && y !== undefined) {
    await clickOnCanvas(page, x, y);
  } else {
    await clickInTheMiddleOfTheScreen(page);
  }

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(resolvedFilePath);
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
  needToWait = true,
) {
  await TopLeftToolbar(page).openFile();
  await OpenStructureDialog(page).pasteFromClipboard();
  await PasteFromClipboardDialog(page).openStructureTextarea.fill(
    fillStructure,
  );
  if (needToWait) {
    await waitForLoad(page, async () => {
      await PasteFromClipboardDialog(page).addToCanvasButton.click();
    });
  } else {
    await PasteFromClipboardDialog(page).addToCanvasButton.click();
  }
}
export async function pasteFromClipboardAndOpenAsNewProject(
  page: Page,
  fillStructure: string,
  needToWait = true,
) {
  await TopLeftToolbar(page).openFile();
  await OpenStructureDialog(page).pasteFromClipboard();
  await PasteFromClipboardDialog(page).openStructureTextarea.fill(
    fillStructure,
  );
  if (needToWait) {
    await waitForLoad(page, async () => {
      await PasteFromClipboardDialog(page).openAsNewButton.click();
    });
  } else {
    await PasteFromClipboardDialog(page).openAsNewButton.click();
  }
}

/**
 *  Usage examples:
 *  1. pasteFromClipboardAndAddToMacromoleculesCanvas(
 *    page,
 *    MacroFileType.Ket,
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
 * @param {errorExpected}  errorExpected - have to be true if you know if error should occure
 */
export async function pasteFromClipboardAndAddToMacromoleculesCanvas(
  page: Page,
  structureFormat:
    | Exclude<MacroFileType, MacroFileType.Sequence | MacroFileType.FASTA>
    | [MacroFileType.FASTA, SequenceMonomerType]
    | [
        MacroFileType.Sequence,
        Exclude<SequenceMonomerType, SequenceMonomerType.Peptide>,
      ]
    | [
        MacroFileType.Sequence,
        [SequenceMonomerType.Peptide, PeptideLetterCodeType],
      ],
  fillStructure: string,
  errorExpected = false,
) {
  const monomerTypeSelector =
    PasteFromClipboardDialog(page).monomerTypeSelector;
  const addToCanvasButton = PasteFromClipboardDialog(page).addToCanvasButton;
  const openStructureTextarea =
    PasteFromClipboardDialog(page).openStructureTextarea;

  let structureType: MacroFileType = MacroFileType.Ket;
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

  await TopLeftToolbar(page).openFile();
  await OpenStructureDialog(page).pasteFromClipboard();

  if (structureFormat !== MacroFileType.Ket) {
    await PasteFromClipboardDialog(page).selectContentType(structureType);
  }

  if (
    structureType === MacroFileType.Sequence ||
    structureType === MacroFileType.FASTA
  ) {
    monomerTypeSelector.click();
    const lowCaseSequenceFormat = sequenceOrFastaType.toLowerCase();
    await page.locator(`[data-value=${lowCaseSequenceFormat}]`).click();

    if (
      sequenceOrFastaType === SequenceMonomerType.Peptide &&
      peptideType === PeptideLetterCodeType.threeLetterCode
    ) {
      await PasteFromClipboardDialog(page).selectPeptideLetterType(
        PeptideLetterCodeType.threeLetterCode,
      );
    }
  }

  await openStructureTextarea.fill(fillStructure);

  if (!errorExpected) {
    await waitForLoad(page, async () => {
      await addToCanvasButton.click();
    });
  } else {
    await addToCanvasButton.click();
  }
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

export async function receiveRxnFileComparisonData(
  page: Page,
  metaDataIndexes: number[],
  expectedRxnFileName: string,
  rxnFileType?: MolfileFormat,
) {
  const rxnFileExpected = fs
    .readFileSync(expectedRxnFileName, 'utf8')
    .split('\n')
    .filter((_str, index) => !metaDataIndexes.includes(index));
  const rxnFile = (
    await page.evaluate(
      (fileType) => window.ketcher.getRxn(fileType),
      rxnFileType,
    )
  )
    .split('\n')
    .filter((_str, index) => !metaDataIndexes.includes(index));

  return { rxnFileExpected, rxnFile };
}

// The function is used to save the structure that is placed in the center
// of canvas when opened. So when comparing files, the coordinates
// always match and there is no difference between the results when comparing.
export async function saveToFile(filename: string, data: string) {
  const testDataDirectory = getTestDataDirectory();
  const resolvedFilePath = path.resolve(testDataDirectory, filename);
  if (process.env.GENERATE_DATA === 'true') {
    return await fs.promises.writeFile(resolvedFilePath, data, 'utf-8');
  }
}

export async function openPasteFromClipboard(
  page: Page,
  fillStructure: string,
) {
  const openStructureTextarea =
    PasteFromClipboardDialog(page).openStructureTextarea;

  await TopLeftToolbar(page).openFile();
  await OpenStructureDialog(page).pasteFromClipboard();
  await openStructureTextarea.fill(fillStructure);
  // The 'Add to Canvas' button step is removed.
  // If you need to use this function in another context and include the button press, you can do so separately.
  // await waitForLoad(page);
}

export async function copyContentToClipboard(page: Page, content: string) {
  await page.evaluate(async (content) => {
    await navigator.clipboard.writeText(content);
  }, content);
}
