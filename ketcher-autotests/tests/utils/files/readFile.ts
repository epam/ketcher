import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';
import {
  selectTopPanelButton,
  pressButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  waitForLoad,
} from '@utils';

export async function readFileContents(filePath: string) {
  console.log('base directory', __dirname);
  console.log('current working directory', process.cwd());
  const resolvedFilePath = path.resolve(process.cwd(), filePath);
  console.log('resolvedFilePath', resolvedFilePath);
  const fileContent = await fs.promises.readFile(resolvedFilePath, 'utf8');
  console.log('fileContent', fileContent);
  return fileContent;
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

/**
 * Open file and put in center of canvas
 * Should be used to prevent extra delay() calls in test cases
 */
export async function openFileAndAddToCanvas(filename: string, page: Page) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile(filename, page);
  await waitForLoad(page, () => {
    pressButton(page, 'Add to Canvas');
  });
  await pressButton(page, 'Add to Canvas');

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
  const filePath = path.resolve(process.cwd(), expectedCmlFileName);
  const cmlFileExpected = (await readFileContents(filePath)).split('\n');
  const data = await page.evaluate(async () => {
    return {
      // cml: await window.ketcher.getCml(),
      struct: window.ketcher.editor.struct(),
    };
  });
  const cmlFile = '1\n2\n3'.split('\n');
  console.log('data struct', data.struct);

  return { cmlFile, cmlFileExpected };
}

export async function openFromFileViaClipboard(filename: string, page: Page) {
  const fileContent = await readFileContents(filename);
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fileContent);
  await waitForLoad(page, () => {
    pressButton(page, 'Add to Canvas');
  });
}
