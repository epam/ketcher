import { test } from '@playwright/test';
import {
  doubleClickOnAtom,
  drawBenzeneRing,
  pressButton,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
} from '@utils';
import {
  checkSmartsValue,
  setAromaticity,
  setChirality,
  setCustomQuery,
} from './utils';

test.describe('Query features', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await drawBenzeneRing(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', 0);
    await waitForAtomPropsModal(page);
    await page.getByTestId('Query specific-section').click();
  });

  test('Setting aromaticity', async ({ page }) => {
    await setAromaticity(page, 'aromatic');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6]1-[#6]=[#6]-[#6]=[#6]-[#6]=1');
  });

  test('Setting chirality', async ({ page }) => {
    await setChirality(page, 'clockwise');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6]1-[#6]=[#6]-[#6]=[#6]-[#6]=1');
  });
});

test.describe('Custom query', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await drawBenzeneRing(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', 0);
    await waitForAtomPropsModal(page);
  });

  test('Setting custom query', async ({ page }) => {
    await setCustomQuery(page, '@@');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[!#1]1-[#6]=[#6]-[#6]=[#6]-[#6]=1');
  });
});
