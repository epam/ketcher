import { Page } from '@playwright/test';
import {
  selectTopPanelButton,
  pressButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
} from '@utils';
import fs from 'fs';
import { MolfileFormat } from 'ketcher-core';

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
// Open file and put in center of canvas
export async function openFileAndAddToCanvas(filename: string, page: Page) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile(filename, page);
  await pressButton(page, 'Add to Canvas');
  await clickInTheMiddleOfTheScreen(page);
}

export async function receiveMolFileComparisonData(
  page: Page,
  metaDataIndexes: number[],
  expectedMolFileName: string,
  molFileType?: MolfileFormat
) {
  const molFileExpected = fs
    .readFileSync(expectedMolFileName, 'utf8')
    .split('\n')
    .filter((_str, index) => !metaDataIndexes.includes(index));
  const molFile = (
    await page.evaluate(
      (fileType) => window.ketcher.getMolfile(fileType),
      molFileType
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
  rxnFileType?: MolfileFormat
) {
  const rxnFileExpected = fs
    .readFileSync(expectedRxnFileName, 'utf8')
    .split('\n')
    .filter((_str, index) => !metaDataIndexes.includes(index));
  const rxnFile = (
    await page.evaluate(
      (fileType) => window.ketcher.getRxn(fileType),
      rxnFileType
    )
  )
    .split('\n')
    .filter((_str, index) => !metaDataIndexes.includes(index));

  return { rxnFileExpected, rxnFile };
}

export async function receiveKetFileComparisonData(
  page: Page,
  expectedKetFileName: string
) {
  const ketFileExpected = fs
    .readFileSync(expectedKetFileName, 'utf8')
    .split('\n');
  const ketFile = (await page.evaluate(() => window.ketcher.getKet())).split(
    '\n'
  );

  return { ketFileExpected, ketFile };
}
