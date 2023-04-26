import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  openFile,
  pressButton,
  delay,
  takeEditorScreenshot,
  selectTopPanelButton,
  TopPanelButton,
} from '@utils';

test('opening molfile', async ({ page }) => {
  await page.goto('');

  await selectTopPanelButton(TopPanelButton.Open, page);

  await openFile('display-abbrev-groups-example.mol', page);

  await page.getByRole('button', { name: 'Add to Canvas' }).click();

  await clickInTheMiddleOfTheScreen(page);

  await takeEditorScreenshot(page);
});

test('opening rnx files', async ({ page }) => {
  /* 
  Test case: EPMLSOPKET-1839
  */
  await page.goto('');

  await selectTopPanelButton(TopPanelButton.Open, page);

  await openFile('1839-ketcher.rxn', page);

  await pressButton(page, 'Add to Canvas');

  await clickInTheMiddleOfTheScreen(page);
  await takeEditorScreenshot(page);
});

test('opening smi files', async ({ page }) => {
  /* 
  Test case: EPMLSOPKET-1840
  */
  await page.goto('');

  await selectTopPanelButton(TopPanelButton.Open, page);

  await openFile('1840-cyclopentyl.smi', page);

  await pressButton(page, 'Add to Canvas');

  await clickInTheMiddleOfTheScreen(page);

  await delay(2);

  await takeEditorScreenshot(page);
});

test('opening inchi files', async ({ page }) => {
  /* 
  Test case: EPMLSOPKET-1841
  */
  await page.goto('');

  await selectTopPanelButton(TopPanelButton.Open, page);

  await openFile('1841-ketcher.inchi', page);

  await pressButton(page, 'Add to Canvas');

  await clickInTheMiddleOfTheScreen(page);

  await delay(2);

  await takeEditorScreenshot(page);
});
