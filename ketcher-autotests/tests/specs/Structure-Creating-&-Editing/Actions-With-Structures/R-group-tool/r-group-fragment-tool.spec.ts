import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  getCoordinatesTopAtomOfBenzeneRing,
  openFileAndAddToCanvas,
  clickOnAtom,
  waitForPageInit,
  clickOnCanvas,
  MolFileFormat,
  deleteByKeyboard,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools/resetCurrentTool';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { setAttachmentPoints } from '@tests/pages/molecules/canvas/AttachmentPointsDialog';
import { RGroup } from '@tests/pages/constants/rGroupDialog/Constants';
import { RGroupDialog } from '@tests/pages/molecules/canvas/R-GroupDialog';

const atomIndex = 3;

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('R-Fragment-Group dialog opening', async ({ page }) => {
    /* Test case: EPMLSOPKET-1582 and EPMLSOPKET-1610
     * Description:  R-Fragment-Group dialog opening
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await RGroupDialog(page).setRGroup(RGroup.R5);
    await takeEditorScreenshot(page);
  });

  test('R-Fragment-Group UI Verification', async ({ page }) => {
    /* Test case: EPMLSOPKET-1583
     * Description: R-Fragment-Group UI Verification
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('R-Fragment-Group dialog cancelling', async ({ page }) => {
    /* Test case: EPMLSOPKET-1584
     * Description:  R-Fragment-Group dialog cancelling
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await RGroupDialog(page).setRGroup(RGroup.R5);
    await RGroupDialog(page).cancel();
    await takeEditorScreenshot(page);
  });

  test('Create Single R-Fragment-Group member', async ({ page }) => {
    /* Test case: EPMLSOPKET-1585
     * Description: Create Single R-Fragment-Group member
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await RGroupDialog(page).setRGroupFragment(RGroup.R5);
    await takeEditorScreenshot(page);
  });

  test('Change R-Group definition for single R-Group member', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1587
     * Description: Change R-Group definition for single R-Group member
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await RGroupDialog(page).setRGroupFragment(RGroup.R5);

    await clickOnCanvas(page, x, y);
    await RGroupDialog(page).setRGroupFragment(RGroup.R8);
    await takeEditorScreenshot(page);
  });

  test('Add attachment point to the R-Group member', async ({ page }) => {
    /* Test case: EPMLSOPKET-1598
     * Description: Change R-Group definition for single R-Group member
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await RGroupDialog(page).setRGroupFragment(RGroup.R5);

    await setAttachmentPoints(page, { x, y }, { primary: true });
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for whole r-group structure', async ({ page }) => {
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    await clickOnAtom(page, 'C', atomIndex);
    await RGroupDialog(page).setRGroupFragment(RGroup.R8);
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for whole r-group structure even with attachment points', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: atomIndex },
      { primary: true },
    );
    await resetCurrentTool(page);
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    await clickOnAtom(page, 'C', atomIndex);
    await page.getByText('R8').click();
    await RGroupDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('Remove R-Group member from R-Group', async ({ page }) => {
    /* Test case: EPMLSOPKET-1589
     * Description: Remove R-Group member from R-Group. File used for test - R-fragment-structure.mol
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/R-fragment-structure.mol',
    );
    await clickInTheMiddleOfTheScreen(page);
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    await page.getByText('R8').click();
    await RGroupDialog(page).unsetRGroupFragment(RGroup.R5);
    await takeEditorScreenshot(page);
  });

  test('Change R-Group definition for multiple R-Group members', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1588
     * Description: Change R-Group definition for multiple R-Group members. File used for test - R-fragment-structure.mol
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/R-fragment-structure.mol',
    );
    await clickInTheMiddleOfTheScreen(page);
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    await page.getByText('R8').click();
    await RGroupDialog(page).setRGroupFragment(RGroup.R7);
    await takeEditorScreenshot(page);
  });

  test('Create several R-Group members', async ({ page }) => {
    /* Test case: EPMLSOPKET-1586
     * Description: Create several R-Group members
     */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/three-structures.mol');

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    await page.getByText('R8').click();
    await RGroupDialog(page).setRGroupFragment(RGroup.R7);

    await page.getByText('R16').click();
    await RGroupDialog(page).setRGroupFragment(RGroup.R8);

    await page.getByText('R14').click();
    await RGroupDialog(page).setRGroupFragment(RGroup.R15);
    await takeEditorScreenshot(page);
  });

  test('Define a structure with attachment points as R-Group member', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1599
     * Description: Define a structure with attachment points as R-Group member
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await setAttachmentPoints(
      page,
      { x, y },
      { primary: true, secondary: true },
    );
    await page.keyboard.press('Control+r');
    await page.keyboard.press('Control+r');
    await clickOnCanvas(page, x, y);
    await page.getByText('R8').click();
    await RGroupDialog(page).setRGroupFragment(RGroup.R5);
    await takeEditorScreenshot(page);
  });

  test('R-Group definition is not deleted when root structure was deleted', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1591
     * Description: R-Group definition is not deleted when root structure was deleted
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/R-fragment-structure.mol',
    );
    await page.getByText('R8').click();
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Delete R-Group member', async ({ page }) => {
    /* Test case: EPMLSOPKET-1590
     * Description: Delete R-Group member
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/R-fragment-structure.mol',
    );

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await page.getByText('R8').click();
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await CommonLeftToolbar(page).selectEraseTool();
    await page.getByText('R8').click();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await selectAllStructuresOnCanvas(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Layout action to the distorted structure with R-Group Label', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1609
     * Description: The structure is layout correctly without R-group label loss.
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/r1-several-distorted.mol',
    );
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste actions Structure with R-Group label', async ({ page }) => {
    /*   Test case: EPMLSOPKET-1601
     * Description: User is able to Copy/Paste structure with R-group label.
     */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/r1-several-structures.mol',
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste actions Structure with R-Group label', async ({ page }) => {
    /*      Test case: EPMLSOPKET-1601
     * Description: User is able to Cut/Paste the structure with R-group label.
     */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/r1-several-structures.mol',
    );
    await cutAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });
});

test.describe('R-Group Fragment Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Save as *.mol V2000 file', async ({ page }) => {
    /* Test case: EPMLSOPKET-1602
     * Description: All R-group members, R-group definition, occurrence,
     * brackets are rendered correctly after saving as *.mol V2000 file.
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/r1-several-structures.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/r1-several-structures-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
  });

  test('Save as *.mol V3000 file', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-1603
     * Description: All R-group members, R-group definition, occurrence,
     * brackets are rendered correctly after saving as *.mol V3000 file.
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V3000/r1-several-structures-V3000.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/r1-several-structures-V3000-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
  });

  test('Save as *.cxsmi file', async ({ page }) => {
    /* Test case: EPMLSOPKET-1604
     * Description: User is able to save the structure with R-group label as .cxsmi file
     */
    await openFileAndAddToCanvas(
      page,
      'Extended-SMILES/r1-several-structures.cxsmi',
    );
    await verifyFileExport(
      page,
      'Extended-SMILES/r1-several-structures-expected.cxsmi',
      FileType.ExtendedSMILES,
    );
  });
});
