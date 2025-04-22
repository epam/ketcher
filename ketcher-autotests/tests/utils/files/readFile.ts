/* eslint-disable max-len */
import * as fs from 'fs';
import * as path from 'path';
import { Page, expect } from '@playwright/test';
import {
  pressButton,
  clickInTheMiddleOfTheScreen,
  delay,
  takeEditorScreenshot,
  clickOnTheCanvas,
  selectImageTool,
  clickOnCanvas,
  MacroFileType,
} from '@utils';
import { waitForLoad } from '@utils/common';
import { getSmiles, getInchi } from '@utils/formats';
import { MolfileFormat } from 'ketcher-core';
import { selectOpenFileTool } from '@tests/pages/common/TopLeftToolbar';
import { openStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import {
  contentTypeSelection,
  monomerTypeSelection,
  pasteFromClipboardDialog,
  peptideLetterTypeSelection,
} from '@tests/pages/common/PasteFromClipboardDialog';
import {
  PeptideLetterCodeType,
  SequenceMonomerType,
} from '@tests/pages/constants/monomers/Constants';

export async function readFileContents(filePath: string) {
  const resolvedFilePath = path.resolve(process.cwd(), filePath);
  return fs.promises.readFile(resolvedFilePath, 'utf8');
}

export async function openFile(filename: string, page: Page) {
  const openFromFileButton = openStructureDialog(page).openFromFileButton;
  // Start waiting for file chooser before clicking. Note no await.
  const fileChooserPromise = page.waitForEvent('filechooser');
  await openFromFileButton.click();
  const fileChooser = await fileChooserPromise;

  // const [fileChooser] = await Promise.all([
  //   // It is important to call waitForEvent before click to set up waiting.
  //   page.waitForEvent('filechooser'),
  //   // Opens the file chooser.
  //   openFromFileButton.click(),
  // ]);
  await fileChooser.setFiles(`tests/test-data/${filename}`);
}

export async function selectOptionInDropdown(filename: string, page: Page) {
  const extention = filename.split('.')[1];
  const options = {
    mol: 'MDL Molfile V3000',
    fasta: 'FASTA',
    seq: 'Sequence',
  };
  const optionText = (options as any)[extention];
  const selector = page.getByTestId('dropdown-select');
  const selectorExists = await selector.isVisible();

  if (selectorExists && extention && extention !== 'ket' && optionText) {
    const selectorText = (await selector.innerText()).replace(
      /(\r\n|\n|\r)/gm,
      '',
    );
    await selector.getByText(selectorText).click();
    const option = page.getByRole('option');
    await option.getByText(optionText).click();
    // to stabilize the test
    await page
      .getByTestId('dropdown-select')
      .getByRole('combobox')
      .allInnerTexts();
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
  const addToCanvasButton = pasteFromClipboardDialog(page).addToCanvasButton;

  await selectOpenFileTool(page);
  await openFile(filename, page);

  // to stabilize the test
  await selectOptionInDropdown(filename, page);

  await waitForLoad(page, async () => {
    await addToCanvasButton.click();
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
) {
  const addToCanvasButton = pasteFromClipboardDialog(page).addToCanvasButton;

  await selectOpenFileTool(page);
  await openFile(filename, page);

  // to stabilize the test
  await selectOptionInDropdown(filename, page);

  if (typeDropdownOption) {
    await monomerTypeSelection(page, typeDropdownOption);
  }

  await waitForLoad(page, async () => {
    await addToCanvasButton.click();
  });
}

export async function openFileAndAddToCanvasAsNewProjectMacro(
  filename: string,
  page: Page,
  typeDropdownOption?: SequenceMonomerType,
) {
  await selectOpenFileTool(page);
  await openFile(filename, page);

  // to stabilize the test
  await selectOptionInDropdown(filename, page);

  if (typeDropdownOption) {
    await monomerTypeSelection(page, typeDropdownOption);
  }

  await waitForLoad(page, async () => {
    await pressButton(page, 'Open as New');
  });
}

export async function openFileAndAddToCanvasAsNewProject(
  filename: string,
  page: Page,
) {
  await selectOpenFileTool(page);
  await openFile(filename, page);

  await selectOptionInDropdown(filename, page);

  await waitForLoad(page, async () => {
    const openAsNewProjectButton = await page.$(
      'button[data-id="Open as New Project"]',
    );
    if (openAsNewProjectButton) {
      await pressButton(page, 'Open as New Project');
    } else {
      await pressButton(page, 'Open as New');
    }
  });
}

export async function openImageAndAddToCanvas(
  filename: string,
  page: Page,
  x?: number,
  y?: number,
) {
  await selectImageTool(page);

  if (x !== undefined && y !== undefined) {
    await clickOnCanvas(page, x, y);
  } else {
    await clickInTheMiddleOfTheScreen(page);
  }

  const inputFile = await page.$('input[type="file"]');
  if (inputFile) {
    await inputFile.setInputFiles(`tests/test-data/${filename}`);
  } else {
    throw new Error('Input file element not found');
  }
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
  const pasteFromClipboardButton =
    openStructureDialog(page).pasteFromClipboardButton;
  const openStructureTextarea =
    pasteFromClipboardDialog(page).openStructureTextarea;
  const addToCanvasButton = pasteFromClipboardDialog(page).addToCanvasButton;

  await selectOpenFileTool(page);
  await pasteFromClipboardButton.click();
  await openStructureTextarea.fill(fillStructure);
  if (needToWait) {
    await waitForLoad(page, async () => {
      await addToCanvasButton.click();
    });
  } else {
    await addToCanvasButton.click();
  }
}
export async function pasteFromClipboardAndOpenAsNewProject(
  page: Page,
  fillStructure: string,
  needToWait = true,
) {
  const pasteFromClipboardButton =
    openStructureDialog(page).pasteFromClipboardButton;
  const openStructureTextarea =
    pasteFromClipboardDialog(page).openStructureTextarea;

  await selectOpenFileTool(page);
  await pasteFromClipboardButton.click();
  await openStructureTextarea.fill(fillStructure);
  if (needToWait) {
    await waitForLoad(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
  } else {
    await pressButton(page, 'Open as New Project');
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
  const pasteFromClipboardButton =
    openStructureDialog(page).pasteFromClipboardButton;
  const monomerTypeSelector =
    pasteFromClipboardDialog(page).monomerTypeSelector;
  const addToCanvasButton = pasteFromClipboardDialog(page).addToCanvasButton;
  const openStructureTextarea =
    pasteFromClipboardDialog(page).openStructureTextarea;

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

  await selectOpenFileTool(page);
  await pasteFromClipboardButton.click();

  if (structureFormat !== MacroFileType.Ket) {
    await contentTypeSelection(page, structureType);
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
      await peptideLetterTypeSelection(
        page,
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

export async function receiveKetFileComparisonData(
  page: Page,
  expectedKetFileName: string,
) {
  const ketFileExpected = fs
    .readFileSync(expectedKetFileName, 'utf8')
    .split('\n');
  const ketFile = (await page.evaluate(() => window.ketcher.getKet())).split(
    '\n',
  );

  return { ketFileExpected, ketFile };
}

export async function getAndCompareSmiles(page: Page, smilesFilePath: string) {
  const smilesFileExpected = await readFileContents(smilesFilePath);
  const smilesFile = await getSmiles(page);
  expect(smilesFile).toEqual(smilesFileExpected);
}

// The function is used to save the structure that is placed in the center
// of canvas when opened. So when comparing files, the coordinates
// always match and there is no difference between the results when comparing.
export async function saveToFile(filename: string, data: string) {
  if (process.env.GENERATE_DATA === 'true') {
    // `tests/test-data/${filename}`,
    return await fs.promises.writeFile(
      `tests/test-data/${filename}`,
      data,
      'utf-8',
    );
  }
}

/*
Example of usage:
await openFileAndAddToCanvas('KET/benzene-arrow-benzene-reagent-hcl.ket', page);
const rxnFile = await getRxn(page, 'v3000');
await saveToFile('Rxn-V3000/benzene-arrow-benzene-reagent-hcl.rxn', rxnFile); */
export async function pasteFromClipboard(page: Page, fillValue: string) {
  const openStructureTextarea =
    pasteFromClipboardDialog(page).openStructureTextarea;

  await openStructureTextarea.fill(fillValue);
}

export async function openPasteFromClipboard(
  page: Page,
  fillStructure: string,
) {
  const pasteFromClipboardButton =
    openStructureDialog(page).pasteFromClipboardButton;
  const openStructureTextarea =
    pasteFromClipboardDialog(page).openStructureTextarea;

  await selectOpenFileTool(page);
  await pasteFromClipboardButton.click();
  await openStructureTextarea.fill(fillStructure);
  // The 'Add to Canvas' button step is removed.
  // If you need to use this function in another context and include the button press, you can do so separately.
  // await waitForLoad(page);
}

export async function placeFileInTheMiddle(
  filename: string,
  page: Page,
  delayInSeconds: number,
) {
  await selectOpenFileTool(page);
  await openFile(filename, page);
  await pressButton(page, 'AddToCanvas');
  await clickInTheMiddleOfTheScreen(page);
  await delay(delayInSeconds);
  await takeEditorScreenshot(page);
  const cmlFile = (await page.evaluate(() => window.ketcher.getCml())).split(
    '/n',
  );
  return { cmlFile };
}

export async function openFromFileViaClipboard(filename: string, page: Page) {
  const pasteFromClipboardButton =
    openStructureDialog(page).pasteFromClipboardButton;
  const addToCanvasButton = pasteFromClipboardDialog(page).addToCanvasButton;
  const openStructureTextarea =
    pasteFromClipboardDialog(page).openStructureTextarea;

  const fileContent = await readFileContents(filename);
  await pasteFromClipboardButton.click();
  await openStructureTextarea.fill(fileContent);
  await selectOptionInDropdown(filename, page);
  await waitForLoad(page, () => {
    addToCanvasButton.click();
  });
}

export async function getAndCompareInchi(page: Page, inchiFilePath: string) {
  const inchiFileExpected = await readFileContents(inchiFilePath);
  const inchiFile = await getInchi(page);
  expect(inchiFile).toEqual(inchiFileExpected);
}
