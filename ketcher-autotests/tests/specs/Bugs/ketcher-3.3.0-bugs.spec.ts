/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, test } from '@playwright/test';
import {
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectAllStructuresOnCanvas,
  selectFlexLayoutModeTool,
  resetZoomLevelToDefault,
  selectMonomer,
  clickInTheMiddleOfTheScreen,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
} from '@utils';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { waitForPageInit } from '@utils/common';
import {
  selectClearCanvasTool,
  turnOnMacromoleculesEditor,
} from '@tests/pages/common/TopLeftToolbar';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { keyboardPressOnCanvas } from '@utils/keyboard/index';
import { Phosphates } from '@constants/monomers/Phosphates';

let page: Page;

async function callContextMenuForAnySymbol(page: Page) {
  const anySymbol = getSymbolLocator(page, {}).first();
  await anySymbol.click({ button: 'right', force: true });
}

test.describe('Ketcher bugs in 3.3.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page, {
      enableFlexMode: false,
      goToPeptides: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await selectClearCanvasTool(page);
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: Able to create antisense RNA/DNA chain in case of multipal chain selection (if not eligable for antisense chain selected)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6695
     * Description: Able to create antisense RNA/DNA chain in case of multipal chain selection (if not eligable for antisense chain selected).
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Select all canvas and call context menu
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A}|RNA1{R(A)}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForAnySymbol(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: Check correct name for sugar in the library for fR', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6695
     * Description: There correct name for sugar in the library for fR.
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Add sugar from library
     * 3. Check name for sugar in the library for fR
     */
    await selectFlexLayoutModeTool(page);
    await selectMonomer(page, Sugars.fR);
    await clickInTheMiddleOfTheScreen(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await getMonomerLocator(page, Sugars.fR).first().hover();
    await waitForMonomerPreview(page);
    // Screenshot suppression is not used on purpose, as it’s required for the test
    await takeEditorScreenshot(page);
  });

  test('Case 3: Tooltip not appears behind monomer icons in the library', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6585
     * Description: Tooltip not appears behind monomer icons in the library.
     * Scenario:
     * 1. Go to Macro
     * 2. Navigate to the monomer library
     * 3. Click on any monomer
     * 4. Without clicking again, hover over another monomer in the library
     */
    await page.getByTestId('summary-Sugars').click();
    await page.getByTestId('5R6Sm5___5-(R)-Methyl-(S)-cEt BNA').click();
    await page.getByTestId('ALmecl___alpha-L-Methylene cLNA').hover();
    await waitForMonomerPreview(page);
    // Screenshot suppression is not used on purpose, as it’s required for the test
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 4: Tooltip not appears when dragging a monomer and pausing without releasing mouse button in Macro mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6332
     * Description: Tooltip not appears when dragging a monomer and pausing without releasing mouse button in Macro mode.
     * Scenario:
     * 1. Go to Macro
     * 2. Select any monomer from the library and put on canvas
     * 3. Click and hold mouse button to pick up monomer
     * 4. Drag monomer across canvas and stop moving it while still holding mouse button
     * 5. Observe that a tooltip appears after monomer stops moving, even though mouse button remains pressed
     */
    await selectFlexLayoutModeTool(page);
    await selectMonomer(page, Peptides._2Nal);
    await clickInTheMiddleOfTheScreen(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getMonomerLocator(page, Peptides._2Nal).click();
    await page.mouse.down();
    await page.mouse.move(300, 400);
    // Screenshot suppression is not used on purpose, as it’s required for the test
    await takeEditorScreenshot(page);
  });

  test('Case 5: Monomer framing should disappear if monomer selected but not hovered', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6293
     * Description: Monomer framing should disappear if monomer selected but not hovered.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Put any monomer on the canvas click on it and move mouse away
     */
    await selectFlexLayoutModeTool(page);
    await selectMonomer(page, Peptides.meC);
    await clickInTheMiddleOfTheScreen(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await getMonomerLocator(page, Peptides.meC).click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.move(300, 400);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 6: Am- peptide should have symbol -Am', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6126
     * Description: Am- peptide should have symbol -Am.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Load from HELM
     */
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{[-Am]}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: Name for h456UR and e6A monomers are correct', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/5648
     * Description: Name for h456UR and e6A monomers are correct.
     * Scenario:
     * 1. Go to Macro mode
     * 2. Go to Library - RNA tab
     * 3. Select h456UR and e6A monomers
     */
    await selectMonomer(page, Bases.h456UR);
    await waitForMonomerPreview(page);
    // Screenshot suppression is not used on purpose, as it’s required for the test
    await takePageScreenshot(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await selectMonomer(page, Bases.e6A);
    await waitForMonomerPreview(page);
    // Screenshot suppression is not used on purpose, as it’s required for the test
    await takePageScreenshot(page);
  });

  test('Case 8: Horizontal/vertical snap-to-distance work for hydrogen bonds', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6863
     * Description: Horizontal/vertical snap-to-distance work for hydrogen bonds.
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from HELM
     * 3. Try to find horizontal snap-to-distance area
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C}|PEPTIDE2{D}$PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getMonomerLocator(page, Peptides.D).click();
    await page.mouse.down();
    await page.mouse.move(630, 340);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
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
      await selectMonomer(page, Sugars._25d3r);
      await waitForMonomerPreview(page);
      // Screenshot suppression is not used on purpose, as it’s required for the test
      await takePageScreenshot(page);
      await keyboardPressOnCanvas(page, 'Escape');
      await selectMonomer(page, Bases._5meC);
      await waitForMonomerPreview(page);
      // Screenshot suppression is not used on purpose, as it’s required for the test
      await takePageScreenshot(page);
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
      await selectFlexLayoutModeTool(page);
      await selectMonomer(page, Sugars.UNA);
      await takePageScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await keyboardPressOnCanvas(page, 'Escape');
      await selectMonomer(page, Bases.V);
      await takePageScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await keyboardPressOnCanvas(page, 'Escape');
      await selectMonomer(page, Phosphates.Test_6_Ph);
      await takePageScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );
});
