/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  keyboardPressOnCanvas,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  resetZoomLevelToDefault,
  takePageScreenshot,
  takeTopToolbarScreenshot,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';
import { getSymbolLocator } from '@utils/macromolecules/monomer';

async function clickOnXButton(page: Page) {
  await page.locator('.css-1icymbx').click();
}

let page: Page;

test.describe('Calculate Properties tests', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await TopLeftToolbar(page).clearCanvas();
    await TopLeftToolbar(page).calculateProperties();
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: Check that "Calculate Properties" icon added to the main toolbar, with the tooltip preview of "Calculate Properties (Alt+C)"', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: "Calculate Properties" icon added to the main toolbar, with the tooltip preview of "Calculate Properties (Alt+C)".
     * Scenario:
     * 1. Go to Macro
     * 2. Check that "Calculate Properties" icon added to the main toolbar, with the tooltip preview of "Calculate Properties (Alt+C)"
     */
    const icon = {
      testId: 'calculate-macromolecule-properties-button',
      title: 'Calculate properties (Alt+C)',
    };
    const iconButton = page.getByTestId(icon.testId);
    await expect(iconButton).toHaveAttribute('title', icon.title);
    await iconButton.hover();
    expect(icon.title).toBeTruthy();
    await takeTopToolbarScreenshot(page);
  });

  test('Case 2: Check that the shortcut Alt+C (Option+C for MacOS) used to invoke the "Calculate Properties" window', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Shortcut Alt+C (Option+C for MacOS) used to invoke the "Calculate Properties" window.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Use shortcut Alt+C (Option+C for MacOS) to invoke the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}$$$$V2.0',
    );
    await keyboardPressOnCanvas(page, 'Alt+C');
    await takePageScreenshot(page);
  });

  test('Case 3: Verify after the user selects one chain/continuous part of one chain and opens the "Calculate Properties" window, Ketcher send the selection to Indigo, and the selection remain', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: After the user selects one chain/continuous part of one chain and opens the "Calculate Properties" window,
     * Ketcher send the selection to Indigo, and the selection remain.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Select one chain/continuous part of one chain
     * 4. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}$$$$V2.0',
    );
    await getSymbolLocator(page, {
      symbolAlias: 'Q',
      nodeIndexOverall: 14,
    }).dblclick();
    await page.keyboard.down('Shift');
    for (let i = 0; i < 12; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
    }
    await page.keyboard.up('Shift');
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 4: Check if only one chain is present on canvas, and the "Calculate Properties" window is opened, Ketcher send the whole canvas to Indigo', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If only one chain is present on canvas, and the "Calculate Properties" window is opened, Ketcher send the whole canvas to Indigo.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}$$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 5: Verify if the "Calculate Properties" window is opened and no selection is made when there is more than one chain on canvas, values in the "Calculate Properties" window blank and grayed out, and the window contain an error message: "Select monomer, chain or part of a chain"', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If the "Calculate Properties" window is opened and no selection is made when there is more than one chain on canvas,
     * values in the "Calculate Properties" window blank and grayed out, and the window contain an error message: "Select monomer, chain or part of a chain".
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}|RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 6: Check that if while the "Calculate Properties" window is opened the selection is removed and there is more than one chain on canvas, values in the "Calculate Properties" window reset to blank and be grayed out, and the window contain an error message: "Select monomer, chain or part of a chain"', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If while the "Calculate Properties" window is opened the selection is removed and there is more than one chain on canvas,
     * values in the "Calculate Properties" window reset to blank and be grayed out, and the window contain an error message: "Select monomer, chain or part of a chain".
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Select one chain/continuous part of one chain
     * 4. Open the "Calculate Properties" window
     * 5. Remove the selection
     * 6. Check that values in the "Calculate Properties" window reset to blank and be grayed out, and the window contain an error message: "Select monomer, chain or part of a chain"
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}|RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await getSymbolLocator(page, {
      symbolAlias: 'Q',
      nodeIndexOverall: 0,
    }).dblclick();
    await page.keyboard.down('Shift');
    for (let i = 0; i < 12; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
    }
    await page.keyboard.up('Shift');
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await takePageScreenshot(page);
  });

  test('Case 7: Check that the default tab is "Peptides", unless the selection (or the single chain on canvas) contains a valid DNA/RNA double-stranded chain without any amino-acids (Then the default tab is "RNA/DNA")', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Default tab is "Peptides", unless the selection (or the single chain on canvas) contains a valid DNA/RNA
     * double-stranded chain without any amino-acids (Then the default tab is "RNA/DNA").
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window (default tab is "Peptides")
     * 5. Add the selection to RNA/DNA chain
     * 6. Check "Calculate Properties" window (default tab is "RNA/DNA")
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}|RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 14,
    }).dblclick();
    await page.keyboard.down('Shift');
    for (let i = 0; i < 12; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
    }
    await page.keyboard.up('Shift');
    await takePageScreenshot(page);
  });

  test('Case 8: Verify if clicking on the "Calculate Properties" icon when the window is opened, or clicking on the X in the "Calculate Properties" window closes that window', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If clicking on the "Calculate Properties" icon when the window is opened, or clicking on the X in the "Calculate Properties" window closes that window.
     * Scenario:
     * 1. Go to Macro
     * 2. Click on the "Calculate Properties" (window is opened)
     * 3. Click on the "Calculate Properties" icon
     * 4. Check that the window is closed
     * 5. Click on the "Calculate Properties" icon again
     * 6. Check that the window is opened
     * 7. Click on the X in the "Calculate Properties" window
     * 8. Check that the window is closed
     */
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await clickOnXButton(page);
    await takePageScreenshot(page);
  });
});
