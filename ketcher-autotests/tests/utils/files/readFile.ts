import * as fs from 'fs';
import * as path from 'path';
import { Page, expect } from '@playwright/test';
import {
  selectTopPanelButton,
  pressButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  waitForLoad,
  delay,
  takeEditorScreenshot,
  clickOnTheCanvas,
} from '@utils';

import { MolfileFormat } from 'ketcher-core';
import { getSmiles, getInchi } from '@utils/formats';

export async function readFileContents(filePath: string) {
  const resolvedFilePath = path.resolve(process.cwd(), filePath);
  return fs.promises.readFile(resolvedFilePath, 'utf8');
}

export async function openFile(filename: string, page: Page) {
  const [fileChooser] = await Promise.all([
    // It is important to call waitForEvent before click to set up waiting.
    page.waitForEvent('filechooser'),
    // Opens the file chooser.
    page
      .getByRole('button', { name: 'or drag file here Open from file' })
      .click(),
  ]);
  await fileChooser.setFiles(`tests/test-data/${filename}`);
}

export async function selectOptionInDropdown(filename: string, page: Page) {
  const extention = filename.split('.')[1];
  const options = {
    mol: 'MDL Molfile V3000',
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
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile(filename, page);

  await selectOptionInDropdown(filename, page);

  await waitForLoad(page, async () => {
    await pressButton(page, 'Add to Canvas');
  });

  if (
    typeof xOffsetFromCenter === 'number' &&
    typeof yOffsetFromCenter === 'number'
  ) {
    await clickOnTheCanvas(page, xOffsetFromCenter, yOffsetFromCenter);
  } else {
    await clickInTheMiddleOfTheScreen(page);
  }
}

export async function openFileAndAddToCanvasAsNewProject(
  filename: string,
  page: Page,
  xOffsetFromCenter?: number,
  yOffsetFromCenter?: number,
) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile(filename, page);

  await selectOptionInDropdown(filename, page);

  await waitForLoad(page, async () => {
    await pressButton(page, 'Open as New Project');
  });

  if (
    typeof xOffsetFromCenter === 'number' &&
    typeof yOffsetFromCenter === 'number'
  ) {
    await clickOnTheCanvas(page, xOffsetFromCenter, yOffsetFromCenter);
  } else {
    await clickInTheMiddleOfTheScreen(page);
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
  await selectTopPanelButton(TopPanelButton.Open, page);
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fillStructure);
  if (needToWait) {
    await waitForLoad(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
  } else {
    await pressButton(page, 'Add to Canvas');
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
  await page.getByRole('dialog').getByRole('textbox').fill(fillValue);
}

export async function openPasteFromClipboard(
  page: Page,
  fillStructure: string,
) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fillStructure);
  // The 'Add to Canvas' button step is removed.
  // If you need to use this function in another context and include the button press, you can do so separately.
  // await waitForLoad(page);
}

export async function placeFileInTheMiddle(
  filename: string,
  page: Page,
  delayInSeconds: number,
) {
  await selectTopPanelButton(TopPanelButton.Open, page);
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
  const fileContent = await readFileContents(filename);
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fileContent);
  await selectOptionInDropdown(filename, page);
  await waitForLoad(page, () => {
    pressButton(page, 'Add to Canvas');
  });
}

export async function getAndCompareInchi(page: Page, inchiFilePath: string) {
  const inchiFileExpected = await readFileContents(inchiFilePath);
  const inchiFile = await getInchi(page);
  expect(inchiFile).toEqual(inchiFileExpected);
}
