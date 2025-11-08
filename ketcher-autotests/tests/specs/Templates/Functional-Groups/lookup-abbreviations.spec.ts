/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import {
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  clickOnCanvas,
  delay,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';

test.describe('Lookup Abbreviations tests', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Lookup Abbreviation appears when typing name', async ({ page }) => {
    // EPMLSOPKET-15523
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('dc');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-selecting template', async ({ page }) => {
    // EPMLSOPKET-15524
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('dc');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation not appearing if typing within time limit ', async ({
    page,
  }) => {
    // EPMLSOPKET-15525, EPMLSOPKET-15533
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('d');
    await delay(5);
    await page.keyboard.type('c');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toHaveCount(0);
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-only name displayed', async ({ page }) => {
    // EPMLSOPKET-15526
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('co2me');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-element from Periodic table', async ({ page }) => {
    // EPMLSOPKET-15527
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('br');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-no matching result', async ({ page }) => {
    // EPMLSOPKET-15528
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('xyz');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-displayed message after deleting typed test', async ({
    page,
  }) => {
    // EPMLSOPKET-15529
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('xyz');
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Backspace');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-ME is highlighted based on priority order', async ({
    page,
  }) => {
    // EPMLSOPKET-15530
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('me');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-verify suggestions list is sorted according to criteria', async ({
    page,
  }) => {
    // EPMLSOPKET-15531, EPMLSOPKET-15535
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('mer');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-available option verification', async ({
    page,
  }) => {
    // EPMLSOPKET-15532
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('xyz');
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Backspace');
    await page.keyboard.type('bro');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-verify suggestions list displayed with a highest similarity', async ({
    page,
  }) => {
    // EPMLSOPKET-15534, EPMLSOPKET-15536
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('hg');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-element from Periodic table in correct format', async ({
    page,
  }) => {
    // EPMLSOPKET-15537
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('ca');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-context window dissapearing after closing it', async ({
    page,
  }) => {
    // EPMLSOPKET-15538
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('ca');
    await page.keyboard.press('Escape');
    const abbreviationLookup = page.getByTestId('AbbreviationLookup');
    await expect(abbreviationLookup).toHaveCount(0);
    await takeEditorScreenshot(page);
  });

  test('Lookup Abbreviation-opened window does not dissapear after switching tabs', async ({
    page,
    browser,
  }) => {
    // EPMLSOPKET-16235
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('mer');
    const newPage = await browser.newPage();
    await newPage.goto('', { waitUntil: 'domcontentloaded' });
    await newPage.bringToFront();
    await page.bringToFront();
    await takeEditorScreenshot(page);
  });

  test('changing atom in a molecule using lookup abbreviation', async ({
    page,
  }) => {
    // EPMLSOPKET-16926
    // will be added with https://github.com/epam/ketcher/issues/2789
    await BottomToolbar(page).benzene();
    await clickInTheMiddleOfTheScreen(page);
    const atomC = 0;
    await page.keyboard.type('mer');
    await page.keyboard.press('Enter');
    await clickOnAtom(page, 'C', atomC);
    await takeEditorScreenshot(page);
  });

  test('changing atom in a molecule with a structure from functional groups using lookup abbreviation', async ({
    page,
  }) => {
    // EPMLSOPKET-16928
    // will be added with https://github.com/epam/ketcher/issues/2789
    await BottomToolbar(page).benzene();
    await clickInTheMiddleOfTheScreen(page);
    const atomC = 0;
    await page.keyboard.type('bn');
    await page.keyboard.press('Enter');
    await clickOnAtom(page, 'C', atomC);
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 100, 100, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });
});
