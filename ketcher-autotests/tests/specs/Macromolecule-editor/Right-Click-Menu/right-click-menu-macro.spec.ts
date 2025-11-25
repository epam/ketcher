/* eslint-disable no-magic-numbers */
import { Page, expect, test } from '@fixtures';
import {
  resetZoomLevelToDefault,
  waitForPageInit,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  takeElementScreenshot,
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  ZoomInByKeyboard,
  ZoomOutByKeyboard,
  dragMouseTo,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOption } from '@tests/pages/constants/contextMenu/Constants';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { MacroBondDataIds } from '@tests/pages/constants/bondSelectionTool/Constants';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;
test.setTimeout(20000);

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await resetZoomLevelToDefault(page);
  await CommonTopLeftToolbar(page).clearCanvas();
});

test.afterAll(async ({ browser }) => {
  const cntxt = page.context();
  await page.close();
  await cntxt.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
});

test(`1. Verify context menu in Snake and Flex modes when right-clicking a monomer (Copy and Delete (Paste disabled))`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: Verify context menu in Snake and Flex modes when right-clicking a monomer (Copy and Delete (Paste disabled))
   * Case:
   *      0. Go to Flex mode
   *      1. Load single monomer
   *      2. Right-click on the monomer to open context menu
   *      3. Take menu screenshot to validate options: Copy and Delete (Paste disabled)
   *      4. Go to Snake mode
   *      5. Right-click on the monomer to open context menu
   *      6. Take menu screenshot to validate options: Copy and Delete (Paste disabled)
   *
   * Version 3.6
   */
  const copyOption = page.getByTestId(MonomerOption.Copy);
  const pasteOption = page.getByTestId(MonomerOption.Paste);
  const deleteOption = page.getByTestId(MonomerOption.Delete);
  const peptideA = getMonomerLocator(page, Peptide.A);

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A}$$$$V2.0',
  );
  await peptideA.click();
  await ContextMenu(page, peptideA).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideA).contextMenuBody,
  );
  await expect(copyOption).toBeEnabled();
  await expect(pasteOption).toBeEnabled();
  await expect(deleteOption).toBeEnabled();

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
  await peptideA.click();
  await ContextMenu(page, peptideA).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideA).contextMenuBody,
  );
  await expect(copyOption).toBeEnabled();
  await expect(pasteOption).toBeEnabled();
  await expect(deleteOption).toBeEnabled();
});

test(`2. Verify context menu in Snake and Flex modes when right-clicking a part of the chain (Copy and Delete (Paste disabled))`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: Verify context menu in Snake and Flex modes when right-clicking a part of the chain (Copy and Delete (Paste disabled))

   * Case:
   *      0. Go to Flex mode
   *      1. Load chain of some monomers
   *      2. Select few monomers in chain (C, D and E)
   *      2. Right-click on selected monomer to open context menu
   *      3. Take menu screenshot to validate options: Copy and Delete (Paste disabled)
   *      4. Go to Snake mode
   *      5. Select few monomers in chain (C, D and E)
   *      6. Right-click on the monomer to open context menu
   *      7. Take menu screenshot to validate options: Copy and Delete (Paste disabled)
   *
   * Version 3.6
   */
  const copyOption = page.getByTestId(MonomerOption.Copy);
  const pasteOption = page.getByTestId(MonomerOption.Paste);
  const deleteOption = page.getByTestId(MonomerOption.Delete);
  const peptideC = getMonomerLocator(page, Peptide.C);
  const peptideD = getMonomerLocator(page, Peptide.D);
  const peptideE = getMonomerLocator(page, Peptide.E);

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A.C.D.E.F}$$$$V2.0',
  );
  await page.keyboard.down('Shift');
  await peptideC.click();
  await peptideD.click();
  await peptideE.click();
  await page.keyboard.up('Shift');

  await ContextMenu(page, peptideD).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideD).contextMenuBody,
  );
  await expect(copyOption).toBeEnabled();
  await expect(pasteOption).toBeEnabled();
  await expect(deleteOption).toBeEnabled();

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
  await page.keyboard.down('Shift');
  await peptideC.click();
  await peptideD.click();
  await peptideE.click();
  await page.keyboard.up('Shift');

  await ContextMenu(page, peptideD).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideD).contextMenuBody,
  );
  await expect(copyOption).toBeEnabled();
  await expect(pasteOption).toBeDisabled();
  await expect(deleteOption).toBeEnabled();
});

test.fail(
  `3. Verify context menu in Snake and Flex modes when right-clicking a bond (Delete (Copy and Paste disabled))`,
  async () => {
    /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: Verify context menu in Snake and Flex modes when right-clicking a bond (Delete (Copy and Paste disabled))

   * Case:
   *      0. Go to Flex mode
   *      1. Load chain of some monomers
   *      2. Select any bond
   *      2. Right-click on selected monomer to open context menu
   *      3. Take menu screenshot to validate options: Delete (Copy and Paste disabled)
   *      4. Go to Snake mode
   *      5. Select any bond
   *      6. Right-click on the monomer to open context menu
   *      7. Take menu screenshot to validate options: Delete (Copy and Paste disabled)
   *
   * Version 3.6
   * IMPORTANT: Test fails because of the bug: https://github.com/epam/ketcher/issues/7326
   */
    const copyOption = page.getByTestId(MonomerOption.Copy);
    const pasteOption = page.getByTestId(MonomerOption.Paste);
    const deleteOption = page.getByTestId(MonomerOption.Delete);
    const randomBond = getBondLocator(page, {
      bondType: MacroBondDataIds.Single,
    }).first();

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F}$$$$V2.0',
    );
    await randomBond.click({ force: true });
    await ContextMenu(page, randomBond).open();
    await takeElementScreenshot(
      page,
      ContextMenu(page, randomBond).contextMenuBody,
    );
    await expect(copyOption).toBeDisabled();
    await expect(pasteOption).toBeDisabled();
    await expect(deleteOption).toBeEnabled();

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await randomBond.click({ force: true });
    await ContextMenu(page, randomBond).open();
    await takeElementScreenshot(
      page,
      ContextMenu(page, randomBond).contextMenuBody,
    );
    await expect(copyOption).toBeDisabled();
    await expect(pasteOption).toBeDisabled();
    await expect(deleteOption).toBeEnabled();
  },
);

test.fail(
  `4. Verify context menu in Snake and Flex modes when right-clicking the canvas (Paste (Copy and Delete disabled))`,
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7391
     * Test case: Verify context menu in Snake and Flex modes when right-clicking the canvas (Paste (Copy and Delete disabled))
     *
     * Case:
     *      0. Go to Flex mode
     *      1. Select any bond
     *      2. Right-click on empty canvas to open context menu
     *      3. Take menu screenshot to validate options: Delete, Copy and Paste are disabled
     *      4. Go to Snake mode
     *      5. Select any bond
     *      6. Right-click on empty canvas to open context menu
     *      7. Take menu screenshot to validate options: Delete, Copy and Paste are disabled
     *
     * Version 3.6
     * IMPORTANT: Test fails because of the bug: https://github.com/epam/ketcher/issues/7392
     */
    const copyOption = page.getByTestId(MonomerOption.Copy);
    const pasteOption = page.getByTestId(MonomerOption.Paste);
    const deleteOption = page.getByTestId(MonomerOption.Delete);
    const canvas = page.getByTestId(KETCHER_CANVAS).first();

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

    await ContextMenu(page, canvas).open();
    await takeElementScreenshot(
      page,
      ContextMenu(page, canvas).contextMenuBody,
    );
    await expect(copyOption).toBeDisabled();
    await expect(pasteOption).toBeDisabled();
    await expect(deleteOption).toBeDisabled();

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);

    await ContextMenu(page, canvas).open();
    await takeElementScreenshot(
      page,
      ContextMenu(page, canvas).contextMenuBody,
    );
    await expect(copyOption).toBeDisabled();
    await expect(pasteOption).toBeDisabled();
    await expect(deleteOption).toBeDisabled();
  },
);

test(`5. Verify context menu in Snake and Flex modes when right-clicking a bond (Delete (Copy and Paste disabled))`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: 1. Verify that menu item order in Flex modes matches required structure (look at examples in ticket)
   *            2. Verify that menu item order in Snake modes matches required structure (look at examples in ticket)
   *            Expected structure:
   *            Copy
   *            Paste
   *            -line-
   *            Create RNA antisense strand
   *            Create DNA antisense strand
   *            -line-
   *            Modify amino acids...
   *            Edit Attachment Points...
   *            -line-
   *            Delete
   * Case:
   *      0. Go to Flex mode
   *      1. Load chain of some monomers
   *      2. Select all structures (using Ctrl+A)
   *      2. Right-click on any monomer to open context menu
   *      3. Take menu screenshot to validate option order
   *      4. Go to Snake mode
   *      5. Select all structures (using Ctrl+A)
   *      6. Right-click on any monomer to open context menu
   *      7. Take menu screenshot to validate option order
   *
   * Version 3.6
   * IMPORTANT: Screenshot is wrong because of the bug: https://github.com/epam/ketcher/issues/7395
   */
  const peptideA = getMonomerLocator(page, Peptide.A);

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A.C.D.E.F}|RNA1{R(A)P}$PEPTIDE1,RNA1,5:R2-1:R1$$$V2.0',
  );
  await selectAllStructuresOnCanvas(page);
  await ContextMenu(page, peptideA).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideA).contextMenuBody,
  );

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
  await selectAllStructuresOnCanvas(page);
  await ContextMenu(page, peptideA).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideA).contextMenuBody,
  );
});

test(`6. Verify that menu item order in Sequence mode matches required structure (look at examples in ticket)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: Verify that menu item order in Sequence mode matches required structure (look at examples in ticket)
   *            Expected structure:
   *            Copy
   *            Paste
   *            -line-
   *            Edit sequence
   *            Start new sequence
   *            -line-
   *            Create RNA antisense strand
   *            Create DNA antisense strand
   *            Establish hydrogen bonds
   *            Remove hydrogen bonds
   *            -line-
   *            Modify in RNA builder...
   *            Modify amino acids...
   *            -line-
   *            Delete
   * Case:
   *      0. Go to Sequence mode
   *      1. Load chain of some monomers
   *      2. Select all structures (using Ctrl+A)
   *      3. Right-click on any monomer to open context menu
   *      4. Take menu screenshot to validate option order
   *
   * Version 3.6
   * IMPORTANT: Screenshot is wrong because of the bug: https://github.com/epam/ketcher/issues/7395
   */
  const peptideA = getSymbolLocator(page, {
    symbolAlias: 'A',
  }).first();

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A.C.D.E.F}|RNA1{R(A)P}$PEPTIDE1,RNA1,5:R2-1:R1$$$V2.0',
  );
  await selectAllStructuresOnCanvas(page);
  await ContextMenu(page, peptideA).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideA).contextMenuBody,
  );
});

test(`7. Verify Undo/Redo after using Copy, Paste from right-click menu`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: Verify Undo/Redo after using Copy, Paste from right-click menu
   * Case:
   *      0. Go to Snake mode
   *      1. Load chain of some monomers
   *      2. Select all structures (using Ctrl+A)
   *      3. Right-click on any monomer to open context menu and click Copy option
   *      4. Right-click on the center of the canvas to open context menu and click Paste
   *      5. Take menu screenshot to validate new chain appearence on the canvas
   *      6. Press Undo button
   *      7. Take menu screenshot to validate copied chain got removed
   *      8. Press Redo button
   *      9. Take menu screenshot to validate new chain appearence on the canvas
   *
   * Version 3.6
   */
  const peptideA = getMonomerLocator(page, Peptide.A);
  const canvas = page.getByTestId(KETCHER_CANVAS).first();

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A.C.D.E.F}|RNA1{R(A)P}$PEPTIDE1,RNA1,5:R2-1:R1$$$V2.0',
  );
  await selectAllStructuresOnCanvas(page);
  await ContextMenu(page, peptideA).click(MonomerOption.Copy);
  await clickInTheMiddleOfTheScreen(page);
  await ContextMenu(page, canvas).click(MonomerOption.Paste);
  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

test(`8. Verify Undo/Redo after using Delete from right-click menu`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: Verify Undo/Redo after using Delete from right-click menu
   * Case:
   *      0. Go to Snake mode
   *      1. Load chain of some monomers
   *      2. Select all structures (using Ctrl+A)
   *      3. Right-click on any monomer to open context menu and click Delete option
   *      5. Take menu screenshot to validate empty canvas
   *      6. Press Undo button
   *      7. Take menu screenshot to validate chain appearence on the canvas
   *      8. Press Redo button
   *      9. Take menu screenshot to validate empty canvas
   *
   * Version 3.6
   */
  const peptideA = getMonomerLocator(page, Peptide.A);

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A.C.D.E.F}|RNA1{R(A)P}$PEPTIDE1,RNA1,5:R2-1:R1$$$V2.0',
  );
  await selectAllStructuresOnCanvas(page);
  await ContextMenu(page, peptideA).click(MonomerOption.Delete);
  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

test(`9. Verify that context menu works correctly on canvas after zooming`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: Verify that context menu works correctly on canvas after zooming
   * Case:
   *      0. Go to Snake mode
   *      1. Load chain of some monomers
   *      2. Zoom In few times
   *      2. Select all structures (using Ctrl+A)
   *      3. Right-click on any monomer to open context menu
   *      5. Take menu screenshot to validate menu appearence
   *      6. Reset Zoom to 100%
   *      7. Zoom Out few times
   *      8. Right-click on any monomer to open context menu
   *      9. Take menu screenshot to validate menu appearence
   *
   * Version 3.6
   */
  const peptideA = getMonomerLocator(page, Peptide.A);

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A.C.D.E.F}|RNA1{R(A)P}$PEPTIDE1,RNA1,5:R2-1:R1$$$V2.0',
  );
  await ZoomInByKeyboard(page, { repeat: 2 });
  await selectAllStructuresOnCanvas(page);
  await ContextMenu(page, peptideA).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideA).contextMenuBody,
  );
  await resetZoomLevelToDefault(page);
  await ZoomOutByKeyboard(page, { repeat: 2 });
  await ContextMenu(page, peptideA).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideA).contextMenuBody,
  );
});

test(`10. Verify that context menu works correctly on canvas after panning`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: Verify that context menu works correctly on canvas after panning
   * Case:
   *      0. Go to Flex mode
   *      1. Load chain of some monomers
   *      2. Drag canvas and move it so some point
   *      2. Select all structures (using Ctrl+A)
   *      3. Right-click on any monomer to open context menu
   *      5. Take menu screenshot to validate menu appearence
   *
   * Version 3.6
   */
  const peptideA = getMonomerLocator(page, Peptide.A);

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A.C.D.E.F}|RNA1{R(A)P}$PEPTIDE1,RNA1,5:R2-1:R1$$$V2.0',
  );
  await CommonLeftToolbar(page).handTool();
  await selectAllStructuresOnCanvas(page);

  await page.mouse.move(100, 100);
  await dragMouseTo(200, 200, page);

  await ContextMenu(page, peptideA).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideA).contextMenuBody,
  );
});
