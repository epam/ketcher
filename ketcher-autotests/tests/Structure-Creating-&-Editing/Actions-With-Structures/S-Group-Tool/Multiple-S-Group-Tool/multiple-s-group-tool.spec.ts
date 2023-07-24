/* eslint-disable no-magic-numbers */
import { Page, expect, test } from '@playwright/test';
import {
  LeftPanelButton,
  selectLeftPanelButton,
  clickInTheMiddleOfTheScreen,
  delay,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  pressButton,
  receiveFileComparisonData,
  selectAtomInToolbar,
  AtomButton,
  resetCurrentTool,
  BondType,
  copyAndPaste,
  cutAndPaste,
  clickOnAtom,
  clickOnBond,
  fillFieldByLabel,
  screenshotBetweenUndoRedo,
  saveToFile,
  RgroupTool,
  selectNestedTool,
  AttachmentPoint,
} from '@utils';
import { getMolfile } from '@utils/formats';

const CANVAS_CLICK_X = 500;
const CANVAS_CLICK_Y = 500;

async function selectMultipleGroup(
  page: Page,
  text: string,
  dataName: string,
  valueRepeatCount: string,
) {
  await page.locator('span').filter({ hasText: text }).click();
  await page.getByRole('option', { name: dataName }).click();
  await page.getByLabel('Repeat count').fill(valueRepeatCount);
  await pressButton(page, 'Apply');
}

test.describe('Multiple S-Group tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await delay(3);
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1506
      Description: The brackets are rendered correctly around Atom
    */
    await openFileAndAddToCanvas('simple-chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnAtom(page, 'C', 3);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88');
  });

  test('Brackets rendering for bond', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1506
      Description: The brackets are rendered correctly around Bond
    */
    await openFileAndAddToCanvas('simple-chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnBond(page, BondType.SINGLE, 3);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88');
  });

  test('Brackets rendering for whole structure', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1506
      Description: The brackets are rendered correctly around whole structure
    */
    await openFileAndAddToCanvas('simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88');
  });

  test('Brackets rendering for whole structure even with attachment points', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await pressButton(page, 'Apply');
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88');
  });

  test('Edit S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1520
      Description: User is able to edit the Multiple S-group.
    */
    await openFileAndAddToCanvas('multiple-group.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnBond(page, BondType.SINGLE, 3);
    await fillFieldByLabel(page, 'Repeat count', '99');
    await pressButton(page, 'Apply');
    await resetCurrentTool(page);
  });

  test('Add atom on Chain with Data S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1521
      Description: User is able to add atom on structure with Multiple S-group.
    */
    await openFileAndAddToCanvas('multiple-group.ket', page);
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnAtom(page, 'C', 3);
    await resetCurrentTool(page);
  });

  test('Delete and Undo/Redo atom on Chain with Multiple S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1521
      Description: User is able to delete and undo/redo atom on structure with Multiple S-group.
    */
    await openFileAndAddToCanvas('multiple-group.ket', page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Delete whole Chain with Multiple S-Group and Undo/Redo', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1521
      Description: User is able to delete whole Chain with Multiple S-Group and undo/redo.
    */
    await openFileAndAddToCanvas('multiple-group.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Add R-Group Label and Undo/Redo on Chain with Multiple S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1521
      Description: User is able to add R-Group Label and Undo/Redo on structure with Multiple S-group.
    */
    const rGroupName = 'R8';
    await openFileAndAddToCanvas('multiple-group.ket', page);
    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    await clickOnAtom(page, 'C', 3);
    await page.getByRole('button', { name: rGroupName }).click();
    await pressButton(page, 'Apply');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Copy/Paste structure with Multiple S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1522
      Description: User is able to copy and paste structure with Multiple S-group.
    */
    await openFileAndAddToCanvas('multiple-group.ket', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Cut/Paste structure with Multiple S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1522
      Description: User is able to cut and paste structure with Multiple S-group.
    */
    await openFileAndAddToCanvas('multiple-group.ket', page);
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Save/Open Multiple S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1523
      Description: User is able to save and open structure with Multiple S-group.
    */
    await openFileAndAddToCanvas('multiple-group-data.ket', page);
    const expectedFile = await getMolfile(page);
    await saveToFile('multiple-group-data-expected.mol', expectedFile);
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/multiple-group-data-expected.mol',
        metaDataIndexes: METADATA_STRING_INDEX,
      });
    expect(molFile).toEqual(molFileExpected);
  });
});
