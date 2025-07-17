/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
import { Page, expect, test } from '@playwright/test';
import {
  delay,
  MacroFileType,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
} from '@utils/canvas';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
} from '@utils/canvas/tools';
import { switchToRNAMode } from '@utils/macromolecules/sequence';
import { waitForPageInit } from '@utils/common/loaders';
import { pasteFromClipboardAndAddToMacromoleculesCanvas } from '@utils/files/readFile';
import {
  getMonomerLocator,
  getSymbolLocator,
  modifyInRnaBuilder,
} from '@utils/macromolecules/monomer';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  FavoriteStarSymbol,
  RNASection,
} from '@tests/pages/constants/library/Constants';
import { Peptides } from '@constants/monomers/Peptides';
import { Presets } from '@constants/monomers/Presets';
import { Sugars } from '@constants/monomers/Sugars';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Nucleotides } from '@constants/monomers/Nucleotides';
import { Chem } from '@constants/monomers/Chem';
import {
  resetZoomLevelToDefault,
  ZoomInByKeyboard,
  ZoomOutByKeyboard,
} from '@utils/keyboard';
import { clickInTheMiddleOfTheScreen } from '@utils/clicks';

let page: Page;

async function configureInitialState(page: Page) {
  await selectSequenceLayoutModeTool(page);
  await switchToRNAMode(page);
  await Library(page).switchToRNATab();
  await Library(page).openRNASection(RNASection.Nucleotides);
  await Library(page).openRNASection(RNASection.Presets);
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
  await expect(Library(page).favoritesTab).toHaveText(FavoriteStarSymbol);
});

test('3. Check that tooltip preview for hovering over the ★ - "Favorites"', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6909
   * Description: Check that tooltip preview for hovering over the ★ - "Favorites"
   * Case:
   * 1. Open Ketcher and turn on Macromolecules editor
   * 2. Check that tooltip preview for hovering over the ★ - "Favorites"
   */
  const tooltipText = await Library(page).favoritesTab.getAttribute('title');
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
  await Library(page).switchToPeptidesTab();
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await Library(page).switchToCHEMTab();
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
  await Library(page).switchToRNATab();
  await Library(page).rnaBuilder.collapse();
  await Library(page).rnaBuilder.collapse();
  await Library(page).openRNASection(RNASection.Nucleotides);
  await Library(page).openRNASection(RNASection.Presets);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await Library(page).openRNASection(RNASection.Sugars);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await Library(page).openRNASection(RNASection.Bases);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await Library(page).openRNASection(RNASection.Phosphates);
  await takeMonomerLibraryScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await Library(page).openRNASection(RNASection.Nucleotides);
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.collapse();
    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).openRNASection(RNASection.Presets);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Library(page).openRNASection(RNASection.Sugars);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Library(page).openRNASection(RNASection.Bases);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Library(page).openRNASection(RNASection.Phosphates);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Library(page).openRNASection(RNASection.Nucleotides);
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.collapse();
    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).rnaTab.presetsSection.hover();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.collapse();
    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).rnaTab.sugarsSection.hover();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.collapse();
    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).rnaTab.basesSection.hover();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.collapse();
    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).rnaTab.phosphatesSection.hover();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.collapse();
    await Library(page).openRNASection(RNASection.Presets);
    await Library(page).rnaTab.nucleotidesSection.hover();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[Rmn2ce]([m3T])[nen]}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await Library(page).rnaBuilder.selectBaseSlot();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[4sR]([ipr5U])[cm].[ALtri1]([br5U])[eop].[5S6Rm5]([m6U])[ibun].[5S6Sm5]([nC6n5U])[m2nen].[afl2Nm]([npr5U])}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'U' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await Library(page).rnaBuilder.selectBaseSlot();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[Rmn2ce]([m3T])[nen]}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await Library(page).rnaBuilder.selectSugarSlot();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[4sR]([ipr5U])[cm].[ALtri1]([br5U])[eop].[5S6Rm5]([m6U])[ibun].[5S6Sm5]([nC6n5U])[m2nen].[afl2Nm]([npr5U])}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'U' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await Library(page).rnaBuilder.selectSugarSlot();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[Rmn2ce]([m3T])[nen]}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await Library(page).rnaBuilder.selectPhosphateSlot();
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
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[4sR]([ipr5U])[cm].[ALtri1]([br5U])[eop].[5S6Rm5]([m6U])[ibun].[5S6Sm5]([nC6n5U])[m2nen].[afl2Nm]([npr5U])}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'U' }).first();
    await modifyInRnaBuilder(page, symbolT);
    await Library(page).rnaBuilder.selectPhosphateSlot();
    await takeMonomerLibraryScreenshot(page);
  },
);

const monomerToDrag = [
  Peptides.Cys_Bn,
  Presets.MOE_A_P,
  Sugars.FMOE,
  Phosphates.bP,
  Nucleotides.AmMC6T,
  Chem.DOTA,
];

for (const monomer of monomerToDrag) {
  test(`19.1 Verify that user can drag  ${monomer.alias} monomer from the library and favorites and drop it onto the canvas (Flex mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Verify that user can click an element (Favoutites, RNA/DNA, Peptides, CHEM, Presets)
     *              from the library and drop it onto the canvas (Flex mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Flex mode
     * 3. Add target monomer to Favorites
     * 4. Drag monomer from Library and drop it on the canvas
     * 5. Drag same monomer from Favoriters and drop it on the canvas
     * 6. Take screenshot to validate it appeared on the canvas
     *
     * Version 3.6
     */
    await selectFlexLayoutModeTool(page);
    await Library(page).addMonomerToFavorites(monomer);
    await Library(page).dragMonomerOnCanvas(monomer, { x: 100, y: 100 });
    await Library(page).dragMonomerOnCanvas(monomer, { x: 200, y: 200 }, true);

    const monomerOnCanvas = getMonomerLocator(page, monomer);
    if (monomer !== Presets.MOE_A_P) {
      await expect(monomerOnCanvas).toHaveCount(2);
    } else {
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });
}

for (const monomer of monomerToDrag) {
  test(`19.2 Verify that user can drag  ${monomer.alias} monomer from the library and favorites and drop it onto the canvas (Snake mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Verify that user can click an element (Favoutites, RNA/DNA, Peptides, CHEM, Presets)
     *              from the library and drop it onto the canvas (Snake mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Snake mode
     * 3. Add target monomer to Favorites
     * 4. Drag monomer from Library and drop it on the canvas
     * 5. Drag same monomer from Favoriters and drop it on the canvas
     * 6. Take screenshot to validate it appeared on the canvas
     *
     * Version 3.6
     */
    await selectSnakeLayoutModeTool(page);
    await Library(page).addMonomerToFavorites(monomer);
    await Library(page).dragMonomerOnCanvas(monomer, { x: 100, y: 100 });
    await Library(page).dragMonomerOnCanvas(monomer, { x: 200, y: 200 }, true);

    const monomerOnCanvas = getMonomerLocator(page, monomer);
    if (monomer !== Presets.MOE_A_P) {
      await expect(monomerOnCanvas).toHaveCount(2);
    } else {
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });
}

for (const monomer of monomerToDrag) {
  test(`20.1 Verify ghost image of  ${monomer.alias} while it is hovered over canvas (Flex mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: 1. Verify that the cursor aligns to the top-left corner of a monomer (Favoutites, RNA/DNA, Peptides, CHEM, Presets)
     *                 during dragging (Flex mode)
     *              2. Verify that the ghost image (Favoutites, RNA/DNA, Peptides, CHEM, Presets) appears in greyscale and includes
     *                 labels while dragging also the ghost image is shown at 100% scale when canvas zoom is 100% (Flex mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Flex mode
     * 3. Grab target monomer From library and move over canvas
     * 4. Take screenshot to validate it appeared on the canvas
     *
     * Version 3.6
     */
    await selectFlexLayoutModeTool(page);
    await Library(page).hoverMonomer(monomer);
    await page.mouse.down();
    await page.mouse.move(100, 100);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.up();
  });
}

for (const monomer of monomerToDrag) {
  test(`20.2 Verify ghost image of  ${monomer.alias} while it is hovered over canvas (Snake mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: 1. Verify that the cursor aligns to the top-left corner of a monomer (Favoutites, RNA/DNA, Peptides, CHEM, Presets)
     *                 during dragging (Snake mode)
     *              2. Verify that the ghost image (Favoutites, RNA/DNA, Peptides, CHEM, Presets) appears in greyscale and includes
     *                 labels while dragging also the ghost image is shown at 100% scale when canvas zoom is 100% (Snake)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Snake mode
     * 3. Grab target monomer From library and move over canvas
     * 4. Take screenshot to validate it appeared on the canvas
     *
     * Version 3.6
     */
    await selectSnakeLayoutModeTool(page);
    await Library(page).hoverMonomer(monomer);
    await page.mouse.down();
    await page.mouse.move(100, 100);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.up();
  });
}

for (const monomer of monomerToDrag) {
  test(`21.1 Check ${monomer.alias} monomer's ghost image initially 100% scale adjusts canvas scale while hovered over (Flex mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Check if the canvas is zoomed to a level other than 100%, the "ghost image" of a monomer (Favoutites, RNA/DNA, Peptides, CHEM, Presets)
     *              selected from the library should first appear at its original size (100%) when clicked. However, once the "ghost image" is dragged onto
     *              the canvas, it should automatically adjust its size to match the current zoom level of the canvas (x%) (Flex mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Flex mode
     * 3. Set Canvas Scale to 400%
     * 4. Grab target monomer from library (but hold it still)
     * 5. Take library screenshot to validate grabbed canvas has 100% scale
     * 6. Hover it over canvas
     * 7. Take canvas screenshot to validate grabbed canvas adjusted it's scale to 400%
     *
     * Version 3.6
     */
    await selectFlexLayoutModeTool(page);
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await Library(page).hoverMonomer(monomer);

    const box = await page.getByTestId(monomer.testId).boundingBox();
    if (!box) throw new Error('Monomer element not found');

    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 - 2,
      box.y + box.height / 2 - 2,
    );
    await takeMonomerLibraryScreenshot(page);
    await page.mouse.move(200, 200);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.up();
    await resetZoomLevelToDefault(page);
  });
}

for (const monomer of monomerToDrag) {
  test(`21.2 Check ${monomer.alias} monomer's ghost image initially 100% scale adjusts canvas scale while hovered over (Snake mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Check if the canvas is zoomed to a level other than 100%, the "ghost image" of a monomer (Favoutites, RNA/DNA, Peptides, CHEM, Presets)
     *              selected from the library should first appear at its original size (100%) when clicked. However, once the "ghost image" is dragged onto
     *              the canvas, it should automatically adjust its size to match the current zoom level of the canvas (x%) (Snake mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Snake mode
     * 3. Set Canvas Scale to 400%
     * 4. Grab target monomer from library (but hold it still)
     * 5. Take library screenshot to validate grabbed canvas has 100% scale
     * 6. Hover it over canvas
     * 7. Take canvas screenshot to validate grabbed canvas adjusted it's scale to 400%
     *
     * Version 3.6
     */
    await selectSnakeLayoutModeTool(page);
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await Library(page).hoverMonomer(monomer);

    const box = await page.getByTestId(monomer.testId).boundingBox();
    if (!box) throw new Error('Monomer element not found');

    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 - 2,
      box.y + box.height / 2 - 2,
    );
    await takeMonomerLibraryScreenshot(page);
    await page.mouse.move(200, 200);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.up();
    await resetZoomLevelToDefault(page);
  });
}

for (const monomer of monomerToDrag) {
  test(`22.1 Verify that using Ctrl + -/= zooms in and out and ghost image of ${monomer.alias} scales in real time (Flex mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Verify that using Ctrl + -/= zooms in and out and ghost image (Favoutites, RNA/DNA, Peptides,
     *              CHEM, Presets) scales in real time (Flex mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Flex mode
     * 3. Grab target monomer from library to canvas (but don't release)
     * 4. Zoom in by keyboard shortcut 20 times
     * 5. Take canvas screenshot to validate ghost image got bigger
     * 6. Reset zoom to default
     * 7. Zoom out by keyboard shortcut 20 times
     * 8. Take canvas screenshot to validate ghost image got smaller
     *
     * Version 3.6
     */
    await selectFlexLayoutModeTool(page);
    await Library(page).hoverMonomer(monomer);

    await page.mouse.down();
    await page.mouse.move(200, 200);
    await ZoomInByKeyboard(page, { repeat: 20 });

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await resetZoomLevelToDefault(page);
    await ZoomOutByKeyboard(page, { repeat: 20 });

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    await page.mouse.up();
    await resetZoomLevelToDefault(page);
  });
}

for (const monomer of monomerToDrag) {
  test(`22.2 Verify that using Ctrl + -/= zooms in and out and ghost image of ${monomer.alias} scales in real time (Snake mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Verify that using Ctrl + -/= zooms in and out and ghost image (Favoutites, RNA/DNA, Peptides,
     *              CHEM, Presets) scales in real time (Snake mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Snake mode
     * 3. Grab target monomer from library to canvas (but don't release)
     * 4. Zoom in by keyboard shortcut 20 times
     * 5. Take canvas screenshot to validate ghost image got bigger
     * 6. Reset zoom to default
     * 7. Zoom out by keyboard shortcut 20 times
     * 8. Take canvas screenshot to validate ghost image got smaller
     *
     * Version 3.6
     */
    await selectSnakeLayoutModeTool(page);
    await Library(page).hoverMonomer(monomer);

    await page.mouse.down();
    await page.mouse.move(200, 200);
    await ZoomInByKeyboard(page, { repeat: 20 });

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await resetZoomLevelToDefault(page);
    await ZoomOutByKeyboard(page, { repeat: 20 });

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    await page.mouse.up();
    await resetZoomLevelToDefault(page);
  });
}

for (const monomer of monomerToDrag) {
  test(`23.1 Verify that dropped ${monomer.alias} appears exactly at the cursor location on the canvas (Flex mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Verify that dropped element (Favoutites, RNA/DNA, Peptides, CHEM, Presets) appears exactly
     *              at the cursor location on the canvas (Flex mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Flex mode
     * 3. Grab target monomer from library and drop to certain place on the canvas (x4 times)
     * 4. Take canvas screenshot to validate canvas
     *
     * Version 3.6
     */
    await selectFlexLayoutModeTool(page);
    await Library(page).addMonomerToFavorites(monomer);
    await Library(page).dragMonomerOnCanvas(monomer, { x: 100, y: 100 });
    await Library(page).dragMonomerOnCanvas(monomer, { x: 250, y: 100 });
    await Library(page).dragMonomerOnCanvas(monomer, { x: 100, y: 250 });
    await Library(page).dragMonomerOnCanvas(monomer, { x: 250, y: 250 });

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
}

for (const monomer of monomerToDrag) {
  test(`23.2 Verify that dropped ${monomer.alias} appears exactly at the cursor location on the canvas (Snake mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Verify that dropped element (Favoutites, RNA/DNA, Peptides, CHEM, Presets) appears exactly
     *              at the cursor location on the canvas (Snake mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Snake mode
     * 3. Grab target monomer from library and drop to certain place on the canvas (x4 times)
     * 4. Take canvas screenshot to validate canvas
     *
     * Version 3.6
     */
    await selectSnakeLayoutModeTool(page);
    await Library(page).addMonomerToFavorites(monomer);
    await Library(page).dragMonomerOnCanvas(monomer, { x: 100, y: 100 });
    await Library(page).dragMonomerOnCanvas(monomer, { x: 250, y: 100 });
    await Library(page).dragMonomerOnCanvas(monomer, { x: 100, y: 250 });
    await Library(page).dragMonomerOnCanvas(monomer, { x: 250, y: 250 });

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
}

for (const monomer of monomerToDrag) {
  test(`24.1 Verify that ghost image of ${monomer.alias} is rendered above the library element after click but before drag (Flex mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Verify that ghost image (Favoutites, RNA/DNA, Peptides, CHEM, Presets) is rendered above the
     *              library element after click but before drag (Flex mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Flex mode
     * 3. Grab target monomer from library and drop to certain place on the canvas
     * 4. Grab same monomer and hover it over dropped one
     * 5. Take canvas screenshot to validate it rendered above
     *
     * Version 3.6
     */
    await selectFlexLayoutModeTool(page);
    await Library(page).addMonomerToFavorites(monomer);
    await Library(page).dragMonomerOnCanvas(monomer, { x: 100, y: 100 });
    await Library(page).hoverMonomer(monomer);

    await page.mouse.down();
    await page.mouse.move(110, 110);

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    await page.mouse.up();
  });
}

for (const monomer of monomerToDrag) {
  test(`24.2 Verify that ghost image of ${monomer.alias} is rendered above the library element after click but before drag  (Snake mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Verify that ghost image (Favoutites, RNA/DNA, Peptides, CHEM, Presets) is rendered above the
     *              library element after click but before drag (Snake mode)
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Snake mode
     * 3. Grab target monomer from library and drop to certain place on the canvas
     * 4. Grab same monomer and hover it over dropped one
     * 5. Take canvas screenshot to validate it rendered above
     *
     * Version 3.6
     */
    await selectSnakeLayoutModeTool(page);
    await Library(page).addMonomerToFavorites(monomer);
    await Library(page).dragMonomerOnCanvas(monomer, { x: 100, y: 100 });
    await Library(page).hoverMonomer(monomer);

    await page.mouse.down();
    await page.mouse.move(110, 110);

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    await page.mouse.up();
  });
}

for (const monomer of monomerToDrag) {
  test(`25.1 Verify that drag and drop of ${monomer.alias} can be canceled using Escape key (Flex mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Verify that drag and drop (Favoutites, RNA/DNA, Peptides, CHEM, Presets) can be canceled using Escape key (Flex mode)
     *
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Flex mode
     * 3. Grab target monomer from library and hover it over canvas
     * 4. Press Escape button
     * 5. Release mouse button
     * 6. Validate canvas has no monomers
     *
     * Version 3.6
     */
    await selectFlexLayoutModeTool(page);
    await Library(page).addMonomerToFavorites(monomer);
    await Library(page).hoverMonomer(monomer);

    await page.mouse.down();
    await page.mouse.move(100, 100);
    await page.keyboard.press('Escape');
    await page.mouse.up();

    const monomerOnCanvas = getMonomerLocator(page, {});
    await expect(monomerOnCanvas).toHaveCount(0);
  });
}

for (const monomer of monomerToDrag) {
  test(`25.2 Verify that drag and drop of ${monomer.alias} can be canceled using Escape key (Snake mode)`, async () => {
    /*
     *
     * Test task: https://github.com/epam/ketcher/issues/7419
     * Description: Verify that drag and drop (Favoutites, RNA/DNA, Peptides, CHEM, Presets) can be canceled using Escape key (Snake mode)
     *
     * Case:
     * 1. Open Ketcher and turn on Macromolecules editor
     * 2. Go to Snake mode
     * 3. Grab target monomer from library and hover it over canvas
     * 4. Press Escape button
     * 5. Release mouse button
     * 6. Validate canvas has no monomers
     *
     * Version 3.6
     */
    await selectSnakeLayoutModeTool(page);
    await Library(page).addMonomerToFavorites(monomer);
    await Library(page).hoverMonomer(monomer);

    await page.mouse.down();
    await page.mouse.move(100, 100);
    await page.keyboard.press('Escape');
    await page.mouse.up();

    const monomerOnCanvas = getMonomerLocator(page, {});
    await expect(monomerOnCanvas).toHaveCount(0);
  });
}
