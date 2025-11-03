/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MicroBondDataIds } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  MicroBondOption,
  MonomerOption,
  SequenceSymbolOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import {
  clickOnMiddleOfCanvas,
  keyboardTypeOnCanvas,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  selectAllStructuresOnCanvas,
  takeElementScreenshot,
  ZoomOutByKeyboard,
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { verifyHELMExport } from '@utils/files/receiveFileComparisonData';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

let page: Page;

test.describe('Ketcher bugs in 3.9.0: ', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Tooltip shown and addition not allowed when multiple monomers with free R2 are selected', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7700
     * Description:  System allow to delete monomers leaving connected bonds on the canvas
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from HELM: RNA1{d([Hyp])p.r(A)p.d([Hyp])p.r(A)p.d([Hyp])}$$$$V2.0
     * 3. Press Erase button
     * 4. Press Ctrl+a key to select structure on the canvas
     * 5. Click on all dR monomers
     * 6. Verify that bonds connected to deleted monomers are also deleted
     *
     * Version 3.9
     */
    await ZoomOutByKeyboard(page, { repeat: 2 });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{d([Hyp])p.r(A)p.d([Hyp])p.r(A)p.d([Hyp])}$$$$V2.0',
    );
    await CommonLeftToolbar(page).erase();
    await selectAllStructuresOnCanvas(page);
    const dRMonomers = getMonomerLocator(page, Sugar.dR);
    const dRMonomerCount = await dRMonomers.count();
    for (let index = 0; index < dRMonomerCount; index += 1) {
      await dRMonomers.first().click();
    }
    for (const bondId of [41, 42, 46, 47, 48, 52, 53]) {
      const bondLocator = getBondLocator(page, { bondId });
      expect(await bondLocator.count()).toBe(0);
    }
  });

  test('Case 2: Microstructure disappears from canvas in Sequence mode when adding new sequence row', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7783
     * Description:  Microstructure disappears from canvas in Sequence mode when adding new sequence row
     *
     * Scenario:
     *  1. Open Ketcher in Micro mode and place Benzene ring to canvas.
     *  2. Switch to Macro mode -> Sequence
     *  3. Click the plus button to create a new sequence row.
     *  4. Observe the canvas.
     *  5. Click anywhere on the canvas to exit edit mode.
     *
     * Version 3.9
     */
    await BottomToolbar(page).benzene();
    await clickOnMiddleOfCanvas(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    const newSequenceButton = page.getByTestId('NewSequencePlusButton');
    await keyboardTypeOnCanvas(page, 'Ap');
    await newSequenceButton.click();

    const singleBonds = getBondLocator(page, {
      bondType: MicroBondDataIds.Single,
    });
    const doubleBonds = getBondLocator(page, {
      bondType: MicroBondDataIds.Double,
    });

    expect(await singleBonds.count()).toBe(3);
    expect(await doubleBonds.count()).toBe(3);
  });

  test('Case 3: Undo/redo works wrong for monomer reposition corrected by snapping', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7649
     * Description:  Undo/redo works wrong for monomer reposition corrected by snapping
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Flex (clean canvas)
     * 2. Load from HELM: PEPTIDE1{A.A.A}$$$$V2.0
     * 3. Grab top half of monomer and drag it to bottom part having snapping preventing monomer to move
     * 4. Release
     * 5. Press `Undo` button
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.C}$$$$V2.0',
    );
    const aMonomer = getMonomerLocator(page, Peptide.A).first();
    await aMonomer.hover();
    await page.mouse.down();
    const boundingBox = await aMonomer.boundingBox();
    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2 - 15,
        boundingBox.y + boundingBox.height / 2 - 15,
      );
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2 - 5,
        boundingBox.y + boundingBox.height / 2 - 5,
      );
    }
    await page.mouse.up();
    await CommonTopLeftToolbar(page).undo();
    await expect(aMonomer).not.toBeVisible();
  });

  test('Case 4: Gap between icon and Delete label is twice bigger than it should be in Molecules mode', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7364
     * Description:  Gap between icon and Delete label is twice bigger than it should be in Molecules mode
     *
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from SMART: `C1C=CC=CC=1`
     * 3. Select any atom
     * 4. Right click on selected atom to call context menu
     *
     * Version 3.9
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C1C=CC=CC=1');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).open();
    await takeElementScreenshot(page, page.getByTestId(MicroBondOption.Delete));
  });

  test('Case 5: Line between Paste option and Create RNA antisense strand option is missing in the context menu', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7364
     * Description:  Line between Paste option and Create RNA antisense strand option is missing in the context menu
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Flex (clean canvas)
     * 2. Load from HELM: RNA1{r(A)p}$$$$V2.0
     * 3. Open context on A base
     * 4. Validate that there is a separator line between Paste option and Create RNA antisense strand option
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A)p}$$$$V2.0',
    );
    await ContextMenu(page, getMonomerLocator(page, Base.A).first()).open();
    await takeElementScreenshot(page, page.getByTestId(MonomerOption.Paste), {
      padding: 10,
    });
  });

  test('Case 6: Missing separator line above "Delete" in context menu', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7327
     * Description:  Missing separator line above "Delete" in context menu
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence (clean canvas)
     * 2. Load from HELM: PEPTIDE1{A}|RNA1{r(C)p}$PEPTIDE1,RNA1,1:R2-1:R1$$$V2.0
     * 3. Select whole sequence
     * 4. Open context for A amino acid
     * 5. Validate that there is a separator line above "Delete" in context menu
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A)p}$$$$V2.0',
    );
    await ContextMenu(
      page,
      getSymbolLocator(page, { symbolAlias: 'A' }),
    ).open();
    await takeElementScreenshot(
      page,
      page.getByTestId(SequenceSymbolOption.Delete),
      {
        padding: 20,
      },
    );
  });

  test('Case 7: Ketcher losts aliasHELM property for unknown monomers that makes export to HELM incorrect', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7256
     * Description:  Ketcher losts aliasHELM property for unknown monomers that makes export to HELM incorrect
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence (clean canvas)
     * 2. Load from HELM: RNA1{[Unknown sugar](A)P.R([Unknown base])P.[Unknown sugar]([Unknown base])P.[Unknown sugar](A)[Unknown phosphate].R([Unknown base])[Unknown phosphate].[Unknown sugar]([Unknown base])[Unknown phosphate].[Unknown sugar](A)}|RNA2{R([Unknown base])}|RNA3{[Unknown sugar]([Unknown base])}$RNA1,RNA2,19:R2-1:R1|RNA2,RNA3,1:R2-1:R1$$$V2.0
     * 3. Verify that all unknown monomers are displayed correctly
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[Unknown sugar](A)P.R([Unknown base])P.[Unknown sugar]([Unknown base])P.[Unknown sugar](A)[Unknown phosphate].R([Unknown base])[Unknown phosphate].[Unknown sugar]([Unknown base])[Unknown phosphate].[Unknown sugar](A)}|RNA2{R([Unknown base])}|RNA3{[Unknown sugar]([Unknown base])}$RNA1,RNA2,19:R2-1:R1|RNA2,RNA3,1:R2-1:R1$$$V2.0',
    );
    await verifyHELMExport(
      page,
      'RNA1{[Unknown sugar](A)p.r([Unknown base])p.[Unknown sugar]([Unknown base])p.[Unknown sugar](A)[Unknown phosphate].r([Unknown base])[Unknown phosphate].[Unknown sugar]([Unknown base])[Unknown phosphate].[Unknown sugar](A).r([Unknown base]).[Unknown sugar]([Unknown base])}$$$$V2.0',
    );
  });

  test('Case 8: Pressing Right Scroll Arrow button of top menu cause exception to console', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7770
     * Description:  Pressing Right Scroll Arrow button of top menu cause exception to console
     *
     * Scenario:
     * 1. Open Ketcher in Popup mode
     * 2. Toggle to Macro - Sequence mode
     * 3. Press Right Scroll Arrow button for top menu
     *
     * Version 3.9
     */

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await MacromoleculesTopToolbar(page).arrowScrollRight();
  });
});
