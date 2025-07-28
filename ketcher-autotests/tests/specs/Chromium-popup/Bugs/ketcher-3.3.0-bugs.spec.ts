/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, test } from '@playwright/test';
import { resetZoomLevelToDefault, takePageScreenshot } from '@utils';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { waitForPageInit } from '@utils/common';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { keyboardPressOnCanvas } from '@utils/keyboard/index';
import { Phosphates } from '@constants/monomers/Phosphates';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';

let page: Page;

test.describe('Ketcher bugs in 3.3.0', () => {
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
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test(
    'Case 9: Tooltips on monomer cards in all sections instantly not disappear on hover in popup Ketcher',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6937
       * Bug: https://github.com/epam/ketcher/issues/6833
       * Description: Tooltips on monomer cards in all sections instantly not disappear on hover in popup Ketcher.
       * Scenario:
       * 1. Open the popup version of Ketcher
       * 2. Navigate to any section: Peptides, RNA (Sugars, Bases, or Phosphates), CHEM
       * 3. Hover over any monomer card.
       */
      await Library(page).selectMonomer(Sugars._25d3r);
      await waitForMonomerPreview(page);
      // Screenshot suppression is not used on purpose, as it’s required for the test
      await takePageScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
      await keyboardPressOnCanvas(page, 'Escape');
      await Library(page).selectMonomer(Bases._5meC);
      await waitForMonomerPreview(page);
      // Screenshot suppression is not used on purpose, as it’s required for the test
      await takePageScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 10: Last row of monomers in Sugars, Bases, and Phosphates sections is visible in popup Ketcher',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6937
       * Bug: https://github.com/epam/ketcher/issues/6831
       * Description: Last row of monomers in Sugars, Bases, and Phosphates sections is visible in popup Ketcher.
       * Scenario:
       * 1. Open the popup version of Ketcher
       * 2. Switch to RNA Tab
       * 3. Open the Sugars, Bases, or Phosphates section.
       * 4. Scroll to the bottom of the list
       */
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await Library(page).selectMonomer(Sugars.UNA);
      await takePageScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await keyboardPressOnCanvas(page, 'Escape');
      await Library(page).selectMonomer(Bases.V);
      await takePageScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await keyboardPressOnCanvas(page, 'Escape');
      await Library(page).selectMonomer(Phosphates.Test_6_Ph);
      await takePageScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );
});
