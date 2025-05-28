/* eslint-disable max-len */
import { Page, expect, test } from '@playwright/test';
import {
  delay,
  MacroFileType,
  selectAllStructuresOnCanvas,
  takeMonomerLibraryScreenshot,
} from '@utils/canvas';
import { selectSequenceLayoutModeTool } from '@utils/canvas/tools';
import { switchToRNAMode } from '@utils/macromolecules/sequence';
import { waitForPageInit } from '@utils/common/loaders';
import {
  selectBaseSlot,
  selectPhosphateSlot,
  selectSugarSlot,
  toggleBasesAccordion,
  toggleNucleotidesAccordion,
  togglePhosphatesAccordion,
  togglePresetsAccordion,
  toggleRnaBuilder,
  toggleSugarsAccordion,
} from '@utils/macromolecules/rnaBuilder';
import {
  FavoriteStarSymbol,
  goToCHEMTab,
  goToPeptidesTab,
  goToRNATab,
} from '@utils/macromolecules/library';
import { pasteFromClipboardAndAddToMacromoleculesCanvas } from '@utils/files/readFile';
import {
  getSymbolLocator,
  modifyInRnaBuilder,
} from '@utils/macromolecules/monomer';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

let page: Page;

async function configureInitialState(page: Page) {
  await selectSequenceLayoutModeTool(page);
  await switchToRNAMode(page);
  await goToRNATab(page);
  await toggleNucleotidesAccordion(page);
  await togglePresetsAccordion(page);
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await configureInitialState(page);
});

test.afterEach(async () => {
  await CommonTopLeftToolbar(page).clearCanvas();
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test('1. Verify that the header of the library changed to remove the "Library" title and move the "Hide" option to the ear instead of to the right of the title', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6909
   * Description: Verify that the header of the library changed to remove the "Library" title and
   *              move the "Hide" option to the ear instead of to the right of the title
   * Case:
   * 1. Open Ketcher and turn on Macromolecules editor
   * 2. Take RNA Library screenshot to library changes
   */
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('2. Verify that Favorites tab title renamed to ★ and library cards modified', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6909
   * Description: Verify that Favorites tab title renamed to ★ and library cards modified
   * Case:
   * 1. Open Ketcher and turn on Macromolecules editor
   * 2. Check that Favorites tab title renamed to ★
   */
  const favoritesTab = page.getByTestId('FAVORITES-TAB');
  await expect(favoritesTab).toHaveText(FavoriteStarSymbol);
});

test('3. Check that tooltip preview for hovering over the ★ - "Favorites"', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6909
   * Description: Check that tooltip preview for hovering over the ★ - "Favorites"
   * Case:
   * 1. Open Ketcher and turn on Macromolecules editor
   * 2. Check that tooltip preview for hovering over the ★ - "Favorites"
   */
  const tooltipText = await page
    .getByTestId('FAVORITES-TAB')
    .getAttribute('title');
  expect(tooltipText).toBe('Favorites');
});

test('4. Verify that Peptides and CHEM tabs only have the library cards modified', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6909
   * Description: Verify that Peptides and CHEM tabs only have the library cards modified
   * Case:
   * 1. Open Ketcher and turn on Macromolecules editor
   * 2. Go to Peptides tab
   * 3. Take Library screenshot to check that Peptides only have the library cards modified
   * 4. Go to CHEM tab
   * 5. Take Library screenshot to check that CHEMs only have the library cards modified
   */
  await goToPeptidesTab(page);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await goToCHEMTab(page);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('5. Verify that RNA tab redesign include change in the appearance of library cards', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6909
   * Description: Verify that RNA tab redesign include change in the appearance of library cards
   * Case:
   * 1. Open Ketcher and turn on Macromolecules editor
   * 2. Go to RNA tab
   * 3. Close RNA builder if opened
   * 4. Open Presets accordion
   * 5. Take Library screenshot to check that Presets only have the library cards modified
   * 6. Open Sugars accordion
   * 7. Take Library screenshot to check that Sugars only have the library cards modified
   * 8. Open Bases accordion
   * 9. Take Library screenshot to check that Bases only have the library cards modified
   * 10. Open Phosphates accordion
   * 11. Take Library screenshot to check that Phosphates only have the library cards modified
   * 12. Open Nucleotides accordion
   * 13. Take Library screenshot to check that Nucleotides only have the library cards modified
   */
  await goToRNATab(page);
  await toggleRnaBuilder(page, 'collapse');
  await toggleNucleotidesAccordion(page);
  await togglePresetsAccordion(page);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await toggleSugarsAccordion(page);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await toggleBasesAccordion(page);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await togglePhosphatesAccordion(page);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await toggleNucleotidesAccordion(page);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(
  '6. Verify that RNA tab redesign include change in the appearance of RNA Builder (only if the height of the window is smaller then 648px)',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Verify that RNA tab redesign include change in the appearance of RNA Builder
     *              (only if the height of the window is smaller then 648px)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to RNA tab
     * 3. Open RNA builder if closed
     * 4. Take Library screenshot to check RNA Builder redesign
     */
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'expand');
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  },
);

test(
  '7. Check that RNA tab redesign include change of the subsections (Presets/Sugars/Bases/Phosphates/Nucleotides) from an accordion representation to a tab representation (only if the height of the window is smaller then 720px)',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that RNA tab redesign include change of the subsections
     *              (Presets/Sugars/Bases/Phosphates/Nucleotides) from an accordion representation
     *              to a tab representation (only if the height of the window is smaller then 720px)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to RNA tab
     * 3. Open RNA builder if closed
     * 4. Take Library screenshot to check RNA Builder redesign
     * 5. Open RNA builder if closed
     * 6. Take Library screenshot to check RNA Builder redesign
     * 7. Open Presets accordion
     * 8. Take Library screenshot to check that Presets only have the library cards modified
     * 9. Open Sugars accordion
     * 10. Take Library screenshot to check that Sugars only have the library cards modified
     * 11. Open Bases accordion
     * 12. Take Library screenshot to check that Bases only have the library cards modified
     * 13. Open Phosphates accordion
     * 14. Take Library screenshot to check that Phosphates only have the library cards modified
     * 15. Open Nucleotides accordion
     * 16. Take Library screenshot to check that Nucleotides only have the library cards modified
     */
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'collapse');
    await toggleNucleotidesAccordion(page);
    await togglePresetsAccordion(page);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await toggleSugarsAccordion(page);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await toggleBasesAccordion(page);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await togglePhosphatesAccordion(page);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await toggleNucleotidesAccordion(page);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  },
);

test(
  '8. Check that RNA tab redesign include tooltip preview for hovering over the preset symbol (when the presets section is not open) should be "Presets" (only if the height of the window is smaller then 720px)',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that RNA tab redesign include tooltip preview for hovering over the preset
     *              symbol (when the presets section is not open) should be "Presets" (only if the height
     *              of the window is smaller then 720px)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to RNA tab
     * 3. Close RNA builder if opened
     * 4. Switch to Nucleotides tab to make sure that the Presets tab is not open
     * 5. Hover over the Presets tab symbol
     * 6. Take Library screenshot to validate tooltip preview "Presets"
     */
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'collapse');
    await toggleNucleotidesAccordion(page);
    await page.getByTestId('summary-Presets').hover();
    await delay(1);
    await takeMonomerLibraryScreenshot(page);
  },
);

test(
  '9. Check that RNA tab redesign include tooltip preview for hovering over the square (when the sugars section is not open) should be "Sugars" (only if the height of the window is smaller then 720px)',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that RNA tab redesign include tooltip preview for hovering over the Sugar
     *              symbol (when the Sugars section is not open) should be "Sugars" (only if the height
     *              of the window is smaller then 720px)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to RNA tab
     * 3. Close RNA builder if opened
     * 4. Switch to Nucleotides tab to make sure that the Sugars tab is not open
     * 5. Hover over the Sugars tab symbol
     * 6. Take Library screenshot to validate tooltip preview "Sugars"
     */
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'collapse');
    await toggleNucleotidesAccordion(page);
    await page.getByTestId('summary-Sugars').hover();
    await delay(1);
    await takeMonomerLibraryScreenshot(page);
  },
);

test(
  '10. Check that RNA tab redesign include tooltip preview for hovering over the square (when the Bases section is not open) should be "Sugars" (only if the height of the window is smaller then 720px)',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that RNA tab redesign include tooltip preview for hovering over the Bases
     *              symbol (when the Bases section is not open) should be "Bases" (only if the height
     *              of the window is smaller then 720px)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to RNA tab
     * 3. Close RNA builder if opened
     * 4. Switch to Nucleotides tab to make sure that the Bases tab is not open
     * 5. Hover over the Bases tab symbol
     * 6. Take Library screenshot to validate tooltip preview "Bases"
     */
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'collapse');
    await toggleNucleotidesAccordion(page);
    await page.getByTestId('summary-Bases').hover();
    await delay(1);
    await takeMonomerLibraryScreenshot(page);
  },
);

test(
  '11. Check that RNA tab redesign include tooltip preview for hovering over the square (when the Phosphates section is not open) should be "Phosphates" (only if the height of the window is smaller then 720px)',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that RNA tab redesign include tooltip preview for hovering over the Phosphates
     *              symbol (when the Phosphates section is not open) should be "Phosphates" (only if the height
     *              of the window is smaller then 720px)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to RNA tab
     * 3. Close RNA builder if opened
     * 4. Switch to Nucleotides tab to make sure that the Phosphates tab is not open
     * 5. Hover over the Phosphates tab symbol
     * 6. Take Library screenshot to validate tooltip preview "Phosphates"
     */
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'collapse');
    await toggleNucleotidesAccordion(page);
    await page.getByTestId('summary-Phosphates').hover();
    await delay(1);
    await takeMonomerLibraryScreenshot(page);
  },
);

test(
  '12. Check that RNA tab redesign include tooltip preview for hovering over the square (when the Nucleotides section is not open) should be "Nucleotides" (only if the height of the window is smaller then 720px)',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that RNA tab redesign include tooltip preview for hovering over the Nucleotides
     *              symbol (when the Nucleotides section is not open) should be "Nucleotides" (only if the height
     *              of the window is smaller then 720px)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to RNA tab
     * 3. Close RNA builder if opened
     * 4. Switch to Presets tab to make sure that the Nucleotides tab is not open
     * 5. Hover over the Nucleotides tab symbol
     * 6. Take Library screenshot to validate tooltip preview "Nucleotides"
     */
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'collapse');
    await togglePresetsAccordion(page);
    await page.getByTestId('summary-Nucleotides').hover();
    await delay(1);
    await takeMonomerLibraryScreenshot(page);
  },
);

test(
  '13. Check that when a base is picked in the RNA Builder, clicking on the Base slot in RNA Builder lead to that base in the Bases subsection of the library and the base card appear selected (as if it was clicked on)',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
     * IMPORTANT: Test working not in proper way because we have bug https://github.com/epam/ketcher/issues/6834
     *
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that when a base is picked in the RNA Builder, clicking on
     *              the Base slot in RNA Builder lead to that base in the Bases subsection
     *              of the library and the base card appear selected (as if it was clicked on)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Sequence mode
     * 3. Open RNA builder if closed
     * 4. Load sequence of one symbol (T)
     * 5. Select it on the canvas
     * 6. Open it for edit in the RNA Builder (via "Modify in RNA Builder" option in menu)
     * 7. Click on the Base slot in RNA Builder
     * 8. Take screenshot to validate that base card appear selected in Bases subsection
     */
    await selectSequenceLayoutModeTool(page);
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'expand');
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[Rmn2ce]([m3T])[nen]}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await selectBaseSlot(page);
    await takeMonomerLibraryScreenshot(page);
  },
);

test(
  '14. Check that when multiple bases are already picked in RNA Builder, clicking on the Base slot in RNA Builder lead to one section if all the bases belong to same section',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
     * IMPORTANT: Test working not in proper way because we have bug https://github.com/epam/ketcher/issues/6834
     *
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that when multiple bases are already picked in RNA Builder,
     *              clicking on the Base slot in RNA Builder lead to one section if all
     *              the bases belong to same section
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Sequence mode
     * 3. Open RNA builder if closed
     * 4. Load sequence of few symbols that consists of bases that belongs to one section (T)
     * 5. Select it on the canvas
     * 6. Open it for edit in the RNA Builder (via "Modify in RNA Builder" option in menu)
     * 7. Click on the Base slot in RNA Builder
     * 8. Take screenshot to validate that one section if all the bases belong to same section shown
     */
    await selectSequenceLayoutModeTool(page);
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'expand');
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[4sR]([ipr5U])[cm].[ALtri1]([br5U])[eop].[5S6Rm5]([m6U])[ibun].[5S6Sm5]([nC6n5U])[m2nen].[afl2Nm]([npr5U])}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'U' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await selectBaseSlot(page);
    await takeMonomerLibraryScreenshot(page);
  },
);

test(
  '15. Check that when a sugar is picked in the RNA Builder, clicking on the Sugar slot in RNA Builder lead to that sugar in the Sugar subsection of the library and the base card appear selected (as if it was clicked on)',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
     * IMPORTANT: Test working not in proper way because we have bug https://github.com/epam/ketcher/issues/6834
     *
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that when a base is picked in the RNA Builder, clicking on
     *              the Sugar slot in RNA Builder lead to that sugar in the Sugars subsection
     *              of the library and the sugar card appear selected (as if it was clicked on)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Sequence mode
     * 3. Open RNA builder if closed
     * 4. Load sequence of one symbol (T)
     * 5. Select it on the canvas
     * 6. Open it for edit in the RNA Builder (via "Modify in RNA Builder" option in menu)
     * 7. Click on the Sugar slot in RNA Builder
     * 8. Take screenshot to validate that base card appear selected in Bases subsection
     */
    await selectSequenceLayoutModeTool(page);
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'expand');
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[Rmn2ce]([m3T])[nen]}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await selectSugarSlot(page);
    await takeMonomerLibraryScreenshot(page);
  },
);

test(
  '16. Check that when multiple sugars are already picked in RNA Builder, clicking on the Sugar slot in RNA Builder lead to one section if all the sugars belong to same section',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
     * IMPORTANT: Test working not in proper way because we have bug https://github.com/epam/ketcher/issues/6834
     *
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that when multiple sugars are already picked in RNA Builder,
     *              clicking on the Sugar slot in RNA Builder lead to one section if all
     *              the sugars belong to same section
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Sequence mode
     * 3. Open RNA builder if closed
     * 4. Load sequence of few symbols that consists of sugar that belongs to one section (T)
     * 5. Select it on the canvas
     * 6. Open it for edit in the RNA Builder (via "Modify in RNA Builder" option in menu)
     * 7. Click on the Sugar slot in RNA Builder
     * 8. Take screenshot to validate that one section if all the sugars belong to same section shown
     */
    await selectSequenceLayoutModeTool(page);
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'expand');
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[4sR]([ipr5U])[cm].[ALtri1]([br5U])[eop].[5S6Rm5]([m6U])[ibun].[5S6Sm5]([nC6n5U])[m2nen].[afl2Nm]([npr5U])}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'U' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await selectSugarSlot(page);
    await takeMonomerLibraryScreenshot(page);
  },
);

test(
  '17. Check that when a phopsphate is picked in the RNA Builder, clicking on the Phopsphate slot in RNA Builder lead to that base in the Phopsphates subsection of the library and the phopsphate card appear selected (as if it was clicked on)',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
     * IMPORTANT: Test working not in proper way because we have bug https://github.com/epam/ketcher/issues/6834
     *
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that when a phopsphate is picked in the RNA Builder, clicking on
     *              the Phopsphate slot in RNA Builder lead to that phopsphate in the Phopsphates subsection
     *              of the library and the phopsphate card appear selected (as if it was clicked on)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Sequence mode
     * 3. Open RNA builder if closed
     * 4. Load sequence of one symbol (T)
     * 5. Select it on the canvas
     * 6. Open it for edit in the RNA Builder (via "Modify in RNA Builder" option in menu)
     * 7. Click on the Phopsphate slot in RNA Builder
     * 8. Take screenshot to validate that phopsphate card appear selected in Phopsphates subsection
     */
    await selectSequenceLayoutModeTool(page);
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'expand');
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[Rmn2ce]([m3T])[nen]}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await selectPhosphateSlot(page);
    await takeMonomerLibraryScreenshot(page);
  },
);

test(
  '18. Check that when multiple phopsphates are already picked in RNA Builder, clicking on the Phopsphate slot in RNA Builder lead to one section if all the phopsphates belong to same section',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
     * IMPORTANT: Test working not in proper way because we have bug https://github.com/epam/ketcher/issues/6834
     *
     * Test task: https://github.com/epam/ketcher/issues/6909
     * Description: Check that when multiple phopsphates are already picked in RNA Builder,
     *              clicking on the Phopsphate slot in RNA Builder lead to one section if all
     *              the phopsphates belong to same section
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Sequence mode
     * 3. Open RNA builder if closed
     * 4. Load sequence of few symbols that consists of phopsphates that belongs to one section (T)
     * 5. Select it on the canvas
     * 6. Open it for edit in the RNA Builder (via "Modify in RNA Builder" option in menu)
     * 7. Click on the Phopsphatee slot in RNA Builder
     * 8. Take screenshot to validate that one section if all the phopsphates belong to same section shown
     */
    await selectSequenceLayoutModeTool(page);
    await goToRNATab(page);
    await toggleRnaBuilder(page, 'expand');
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[4sR]([ipr5U])[cm].[ALtri1]([br5U])[eop].[5S6Rm5]([m6U])[ibun].[5S6Sm5]([nC6n5U])[m2nen].[afl2Nm]([npr5U])}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'U' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await selectPhosphateSlot(page);
    await takeMonomerLibraryScreenshot(page);
  },
);
