/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Peptides } from '@constants/monomers/Peptides';
import { Presets } from '@constants/monomers/Presets';
import { Page, test } from '@playwright/test';
import {
  selectClearCanvasTool,
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  takePageScreenshot,
  openFileAndAddToCanvasAsNewProjectMacro,
  selectMacroBond,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  MonomerType,
  selectAllStructuresOnCanvas,
  addMonomerToCenterOfCanvas,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  openFileAndAddToCanvasMacro,
  dragMouseTo,
  selectMonomer,
  pressButton,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import { waitForPageInit } from '@utils/common';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { clickOnSequenceSymbol } from '@utils/macromolecules/sequence';

let page: Page;

async function connectMonomerToAtom(page: Page) {
  await getMonomerLocator(page, Peptides.A).hover();
  await page
    .getByTestId('monomer')
    .locator('g')
    .filter({ hasText: 'R2' })
    .locator('path')
    .hover();
  await page.mouse.down();
  await page.locator('g').filter({ hasText: /^H2N$/ }).locator('rect').hover();
  await page.mouse.up();
}

async function interactWithMicroMolecule(
  page: Page,
  labelText: string,
  action: 'hover' | 'click',
  index: number = 0,
): Promise<void> {
  const element = page
    .locator('g')
    .filter({ hasText: new RegExp(`^${labelText}$`) })
    .locator('rect')
    .nth(index);

  // Wait for the element to be visible
  await element.waitFor({ state: 'visible' });

  // Perform the requested action
  if (action === 'hover') {
    await element.hover();
  } else if (action === 'click') {
    await element.click();
  }
}

test.describe('Ketcher bugs in 3.0.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page, false, false);
  });

  test.afterEach(async () => {
    await selectClearCanvasTool(page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: In the Text-editing mode, the canvas is moved to make the newly added sequence visible', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4526
     * Description: In the Text-editing mode, the canvas is moved to make the newly added sequence visible.
     * Case:
     * 1. Switch to the Macro mode - the Text-editing mode
     * 2. Add sequences to the canvas until they vertically fill the viewport (without using the scroll bar)
     * 3. Press the “Enter” key, and enter one more sequence by typing it manually
     */
    const sequences = [
      'AAAA',
      'CCC',
      'TTT',
      'UUU',
      'GGG',
      'CCC',
      'TTT',
      'UUU',
      'CCC',
    ];
    for (const sequence of sequences) {
      await page.keyboard.type(sequence);
      await page.keyboard.press('Enter');
    }
    await takeEditorScreenshot(page);
  });

  test('Case 2: Switching from Sequence mode to Flex mode and back not shifts visible area of canvas beyond visible frame', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5115
     * Description: Switching from Sequence mode to Flex mode and back not shifts visible area of canvas beyond visible frame.
     * Case:
     * 1. Go to Macromolecules - Snake mode
     * 2. Load from file
     * 3. Switch view to Sequence mode
     * 4. Switch back to Flex mode
     */
    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/switching-from-sequence-mode-to-snake-mode-and-back.ket',
      page,
    );
    await takePageScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takePageScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await takePageScreenshot(page);
  });

  test('Case 3: Connection between molecule and monomer affect an amount of implicit hydrogens', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6021
     * Description: Connection between molecule and monomer affect an amount of implicit hydrogens.
     * Case:
     * 1. Open prepared file in Macro mode -> Flex mode
     * 2. Connect monomer to molecule's atom with implicit hydrogen in label
     */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/monomer-and-micro-structure.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await connectMonomerToAtom(page);
    await takeEditorScreenshot(page);
  });

  test(`Case 4: Replacing all monomers (or part of them) in edit mode system not cuts sequence on two`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5341
     * Description: Replacing all monomers (or part of them) in edit mode system not cuts sequence on two
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Load from file
     * 3. Select three @ symbols in edit mode (having blinking cursor somewhere in the middle of sequence - this is important!
     * 4. Click any monomer from the library (C peptide in my case) - click Yes in appeared Confirm Your Action dialog
     */
    await selectSequenceLayoutModeTool(page);
    await await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bugs/Replacing all monomers (or part of them) in edit mode - works wrong - system cuts sequence on two.ket',
      page,
    );
    await page.keyboard.down('Shift');
    await clickOnSequenceSymbol(page, '@');
    await clickOnSequenceSymbol(page, '@', { nthNumber: 1 });
    await clickOnSequenceSymbol(page, '@', { nthNumber: 2 });
    await page.keyboard.up('Shift');
    await selectMonomer(page, Peptides.C);
    await pressButton(page, 'Yes');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 5: Side chain attachment point shown in wrong place in Snake mode`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6022
     * Description: Side chain attachment point shown in wrong place in Snake mode
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Put on the canvas A preset
     * 3. Turn on Bond tool
     * 4. Hover mouse cursor over base
     * 5. Take a screenshot to validate the side chain attachment point is shown in the right place
     */
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P}$$$$V2.0',
    );
    await selectMacroBond(page, MacroBondTool.SINGLE);
    const baseLocator = getMonomerLocator(page, {
      monomerAlias: 'A',
      monomerType: MonomerType.Base,
    }).first();
    await baseLocator.hover({ force: true });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 6: When pressing Enter, a user can create new sequences in the “Modify RNA Builder” mode`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4723
     * Description: When pressing Enter, a user can create new sequences in the “Modify RNA Builder” mode
     * Scenario:
     * 1. Switch to the Macro mode – the Sequence mode
     * 2. Add a sequence of letters and select any
     * 3. Right-click on selected letters and choose the “Modify in RNA Builder” option
     * 4. Press the “Enter” key
     * 5. Enter letters
     * 6. Take a screenshot to validate user can not create new sequences in the “Modify RNA Builder” mode
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(U)P.R(U)P.R(U)}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    await clickOnSequenceSymbol(page, 'U');
    await clickOnSequenceSymbol(page, 'U', { button: 'right' });
    await page.getByTestId('modify_in_rna_builder').click();
    await page.keyboard.press('Enter');
    await page.keyboard.type('AAA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 7: Bond length is different for monomers loaded from HELM and from the library`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4723
     * Description: Bond length is different for monomers loaded from HELM and from the library
     * Scenario:
     * 1. Switch to the Macro mode – Flex mode
     * 2. Load HELM paste from clipboard way: RNA1{R(A)P}$$$$V2.0
     * 3. Put the same preset from the library and put it above first one
     * 4. Take a screenshot to validate bonds length should be the same (1.5 angstroms)
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P}$$$$V2.0',
    );
    await addMonomerToCenterOfCanvas(page, Presets.A);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 8: After inserting a nucleotide in the Text-editing mode, the cursor blinks in the wrong place`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4533
     * Description: After inserting a nucleotide in the Text-editing mode, the cursor blinks in the wrong place
     * Scenario:
     * 1. Switch to the Macro mode – Flex mode
     * 2. Put T preset from the library select all and copy it to clipboard
     * 3. Switch to the Sequence mode - the Text-editing mode
     * 4. Enter any sequence (for example, UUU)
     * 5. Paste the copied preset to the beginning of the sequence
     * 6. Take a screenshot to validate the cursor blinks in the right place
     */
    await selectFlexLayoutModeTool(page);
    await addMonomerToCenterOfCanvas(page, Presets.T);
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await selectClearCanvasTool(page);
    await selectSequenceLayoutModeTool(page);
    await page.keyboard.press('U');
    await page.keyboard.press('U');
    await page.keyboard.press('U');
    await page.keyboard.press('ArrowUp');
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 9: Movement of microstructures on Sequence mode doesn't work`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5663
     * Description: Movement of microstructures on Sequence mode doesn't work
     * Scenario:
     * 1. Go to Macro mode - Sequence mode
     * 2. Load from file: Movement of microstructures on Sequence mode doesn't work.ket
     * 3. Select all (press CTRL+A)
     * 4. Drag any atom and try to move it
     * 5. Take a screenshot to validate movement of microstructures on Sequence mode works as expected
     */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(
      "KET/Bugs/Movement of microstructures on Sequence mode doesn't work.ket",
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await interactWithMicroMolecule(page, 'H3C', 'hover', 1);
    await dragMouseTo(200, 200, page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
