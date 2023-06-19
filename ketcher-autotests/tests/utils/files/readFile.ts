import * as fs from 'fs';
import { Page } from '@playwright/test';
import {
  selectTopPanelButton,
  pressButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  waitForLoad,
} from '@utils';

export async function readFileContents(filePath: string) {
  return await fs.promises.readFile(filePath, 'utf8');
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

async function isFileLoadedOnKetcherSide(filename: string) {
  const fileContents = await readFileContents(`tests/test-data/${filename}`);
  try {
    if (JSON.parse(fileContents)) {
      return true;
    }
  } catch (er) {}
  if (fileContents.includes('V2000')) {
    return true;
  }
  return false;
}

/**
 * Open file and put in center of canvas
 * Should be used to prevent extra delay() calls in test cases
 */
export async function openFileAndAddToCanvas(filename: string, page: Page) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile(filename, page);
  const isLoadedOnKetcherSide = await isFileLoadedOnKetcherSide(filename);

  if (isLoadedOnKetcherSide) {
    pressButton(page, 'Add to Canvas');
  } else {
    await waitForLoad(page, () => {
      pressButton(page, 'Add to Canvas');
    });
  }

  await clickInTheMiddleOfTheScreen(page);
}

export async function pasteFromClipboardAndAddToCanvas(
  page: Page,
  fillStructure: string
) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fillStructure);
  await pressButton(page, 'Add to Canvas');
}

// The function is used to save the structure that is placed in the center
// of canvas when opened. So when comparing files, the coordinates
// always match and there is no difference between the results when comparing.
export async function saveToFile(filename: string, data: string) {
  if (process.env.GENERATE_DATA === 'true') {
    return await fs.promises.writeFile(
      `tests/test-data/${filename}`,
      data,
      'utf-8'
    );
  }
}
/* 
Example of usage:
await openFileAndAddToCanvas('benzene-arrow-benzene-reagent-hcl.ket', page);
const rxnFile = await getRxn(page, 'v3000');
await saveToFile('benzene-arrow-benzene-reagent-hcl.rxn', rxnFile); */
export async function pasteFromClipboard(page: Page, fillValue: string) {
  await page.getByRole('dialog').getByRole('textbox').fill(fillValue);
}

export async function receiveCmlFileComparisonData(
  page: Page,
  expectedCmlFileName: string
) {
  const cmlFileExpected = fs
    .readFileSync(expectedCmlFileName, 'utf8')
    .split('\n');
  const cmlFile = (await page.evaluate(() => window.ketcher.getCml())).split(
    '\n'
  );

  return { cmlFile, cmlFileExpected };
}

export async function openFromFileViaClipboard(filename: string, page: Page) {
  const fileContent = fs.readFileSync(filename, 'utf8');
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fileContent);
  await waitForLoad(page, () => {
    pressButton(page, 'Add to Canvas');
  });
}
