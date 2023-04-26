import { test } from '@playwright/test';
import {
  buttonLocator,
  clickInTheMiddleOfTheScreen,
  delay,
  openFile,
  pressButton,
  takeEditorScreenshot,
} from '@utils';

test('opening rxn files', async ({ page }) => {
  /* 
  Test case: EPMLSOPKET-1839
  */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();

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

  const openButton = page.locator(buttonLocator);
  await openButton.click();

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
  const openButton = page.locator(buttonLocator);
  await openButton.click();

  await openFile('1841-ketcher.inchi', page);

  await pressButton(page, 'Add to Canvas');

  await clickInTheMiddleOfTheScreen(page);

  await delay(2);

  await takeEditorScreenshot(page);
});
