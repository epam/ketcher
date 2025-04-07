import { expect, Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  getCoordinatesTopAtomOfBenzeneRing,
  selectRingButton,
  RingButton,
  selectNestedTool,
  RgroupTool,
  AttachmentPoint,
  openFileAndAddToCanvas,
  pressButton,
  clickOnAtom,
  receiveFileComparisonData,
  saveToFile,
  copyAndPaste,
  cutAndPaste,
  waitForPageInit,
  selectDropdownTool,
  resetCurrentTool,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  selectLayoutTool,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { getExtendedSmiles } from '@utils/formats';
import {
  pressUndoButton,
  selectClearCanvasTool,
} from '@tests/pages/common/TopLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/selectionTool/Constants';
import {
  selectAreaSelectionTool,
  selectEraseTool,
} from '@tests/pages/common/CommonLeftToolbar';

async function openRGroupModalForTopAtom(page: Page) {
  await selectRingButton(RingButton.Benzene, page);
  await clickInTheMiddleOfTheScreen(page);

  await selectNestedTool(page, RgroupTool.R_GROUP_FRAGMENT);
  const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
  await clickOnCanvas(page, x, y);

  return { x, y };
}

const rGroupFromFile = 'R8';
const atomIndex = 3;
async function selectRGroups(page: Page, rGroups: string[]) {
  await selectDropdownTool(page, 'rgroup-label', 'rgroup-fragment');
  await page.getByText(rGroupFromFile).click();
  for (const rgroup of rGroups) {
    await pressButton(page, rgroup);
  }
  await pressButton(page, 'Apply');
}

async function selectRGroup(page: Page, rgroup: string) {
  await page.locator('button', { hasText: rgroup }).click();
}

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('R-Fragment-Group dialog opening', async ({ page }) => {
    /* Test case: EPMLSOPKET-1582 and EPMLSOPKET-1610
    Description:  R-Fragment-Group dialog opening
    */
    await openRGroupModalForTopAtom(page);
    await selectRGroup(page, 'R5');
    await takeEditorScreenshot(page);
  });

  test('R-Fragment-Group UI Verification', async ({ page }) => {
    /* Test case: EPMLSOPKET-1583
      Description: R-Fragment-Group UI Verification
    */
    await openRGroupModalForTopAtom(page);
    await takeEditorScreenshot(page);
  });

  test('R-Fragment-Group dialog cancelling', async ({ page }) => {
    /* Test case: EPMLSOPKET-1584
      Description:  R-Fragment-Group dialog cancelling
    */
    await openRGroupModalForTopAtom(page);
    await selectRGroup(page, 'R5');
    await page.getByTestId('Cancel').click();
    await takeEditorScreenshot(page);
  });

  test('Create Single R-Fragment-Group member', async ({ page }) => {
    /* Test case: EPMLSOPKET-1585
      Description: Create Single R-Fragment-Group member
    */
    await openRGroupModalForTopAtom(page);
    await page.getByText('R5').click();
    await page.getByTestId('OK').click();
    await takeEditorScreenshot(page);
  });

  test('Change R-Group definition for single R-Group member', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1587
      Description: Change R-Group definition for single R-Group member
    */
    const { x, y } = await openRGroupModalForTopAtom(page);
    await page.getByText('R5').click();
    await page.getByTestId('OK').click();

    await clickOnCanvas(page, x, y);
    await selectRGroup(page, rGroupFromFile);
    await page.getByTestId('OK').click();
    await takeEditorScreenshot(page);
  });

  test('Add attachment point to the R-Group member', async ({ page }) => {
    /* Test case: EPMLSOPKET-1598
      Description: Change R-Group definition for single R-Group member
    */
    const { x, y } = await openRGroupModalForTopAtom(page);
    await page.getByText('R5').click();
    await page.getByTestId('OK').click();

    await page.keyboard.press('Control+r');
    await clickOnCanvas(page, x, y);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByTestId('OK').click();
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for whole r-group structure', async ({ page }) => {
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.R_GROUP_FRAGMENT);
    await clickOnAtom(page, 'C', atomIndex);
    await page.getByText(rGroupFromFile).click();
    await page.getByTestId('OK').click();
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for whole r-group structure even with attachment points', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectDropdownTool(page, 'rgroup-label', 'rgroup-attpoints');
    await clickOnAtom(page, 'C', atomIndex);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByTestId('OK').click();
    await resetCurrentTool(page);
    await selectDropdownTool(page, 'rgroup-label', 'rgroup-fragment');
    await clickOnAtom(page, 'C', atomIndex);
    await page.getByText(rGroupFromFile).click();
    await page.getByTestId('OK').click();
    await takeEditorScreenshot(page);
  });

  test('Remove R-Group member from R-Group', async ({ page }) => {
    /* Test case: EPMLSOPKET-1589
      Description: Remove R-Group member from R-Group. File used for test - R-fragment-structure.mol
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/R-fragment-structure.mol',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
    await selectRGroups(page, ['R5']);
    await takeEditorScreenshot(page);
  });

  test('Change R-Group definition for multiple R-Group members', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1588
      Description: Change R-Group definition for multiple R-Group members. File used for test - R-fragment-structure.mol
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/R-fragment-structure.mol',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
    await selectRGroups(page, ['R7']);
    await takeEditorScreenshot(page);
  });

  test('Create several R-Group members', async ({ page }) => {
    /* Test case: EPMLSOPKET-1586
      Description: Create several R-Group members
    */
    await openFileAndAddToCanvas('Molfiles-V2000/three-structures.mol', page);

    await selectRGroups(page, ['R7']);

    await page.getByText('R16').click();
    await selectRGroup(page, 'R8');
    await page.getByTestId('OK').click();

    await page.getByText('R14').click();
    await selectRGroup(page, 'R15');
    await page.getByTestId('OK').click();
    await takeEditorScreenshot(page);
  });

  test('Define a structure with attachment points as R-Group member', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1599
      Description: Define a structure with attachment points as R-Group member
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await page.getByTestId('OK').click();

    await page.keyboard.press('Control+r');
    await page.keyboard.press('Control+r');
    await clickOnCanvas(page, x, y);
    await selectRGroup(page, 'R5');
    await page.getByTestId('OK').click();
    await takeEditorScreenshot(page);
  });

  test('R-Group definition is not deleted when root structure was deleted', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1591
      Description: R-Group definition is not deleted when root structure was deleted
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/R-fragment-structure.mol',
      page,
    );
    await page.getByText('R8').click();
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
  });

  test('Delete R-Group member', async ({ page }) => {
    /* Test case: EPMLSOPKET-1590
  Description: Delete R-Group member
  */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/R-fragment-structure.mol',
      page,
    );

    await selectAreaSelectionTool(page, SelectionToolType.Fragment);
    await page.getByText('R8').click();
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);

    await pressUndoButton(page);

    await selectEraseTool(page);
    await page.getByText('R8').click();
    await takeEditorScreenshot(page);

    await pressUndoButton(page);

    await selectAllStructuresOnCanvas(page);
    await selectClearCanvasTool(page);
    await takeEditorScreenshot(page);
  });

  test('Layout action to the distorted structure with R-Group Label', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1609
      Description: The structure is layout correctly without R-group label loss.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/r1-several-distorted.mol',
      page,
    );
    await selectLayoutTool(page);
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste actions Structure with R-Group label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1601
      Description: User is able to Copy/Paste structure with R-group label.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/r1-several-structures.mol',
      page,
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste actions Structure with R-Group label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1601
      Description: User is able to Cut/Paste the structure with R-group label.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/r1-several-structures.mol',
      page,
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
    /*
    Test case: EPMLSOPKET-1602
    Description: All R-group members, R-group definition, occurrence, 
    brackets are rendered correctly after saving as *.mol V2000 file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/r1-several-structures.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/r1-several-structures-expected.mol',
      FileType.MOL,
      'v2000',
    );
  });

  test('Save as *.mol V3000 file', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-1603
     * Description: All R-group members, R-group definition, occurrence,
     * brackets are rendered correctly after saving as *.mol V3000 file.
     */
    await openFileAndAddToCanvas(
      'Molfiles-V3000/r1-several-structures-V3000.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/r1-several-structures-V3000-expected.mol',
      FileType.MOL,
      'v3000',
    );
  });

  test('Save as *.cxsmi file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1604
    Description: User is able to save the structure with R-group label as .cxsmi file
    */
    test.fail();
    // function await getExtendedSmiles but get JSON instead cxsmi file
    await openFileAndAddToCanvas(
      'Extended-SMILES/r1-several-structures.cxsmi',
      page,
    );
    const expectedFile = await getExtendedSmiles(page);
    await saveToFile(
      'Extended-SMILES/r1-several-structures-expected.cxsmi',
      expectedFile,
    );

    const { fileExpected: smiFileExpected, file: smiFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Extended-SMILES/r1-several-structures-expected.cxsmi',
      });

    expect(smiFile).toEqual(smiFileExpected);
  });
});
