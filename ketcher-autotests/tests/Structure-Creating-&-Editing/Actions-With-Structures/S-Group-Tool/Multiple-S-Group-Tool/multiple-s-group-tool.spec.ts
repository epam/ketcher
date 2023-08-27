/* eslint-disable no-magic-numbers */
import { Page, expect, test } from '@playwright/test';
import {
  LeftPanelButton,
  selectLeftPanelButton,
  clickInTheMiddleOfTheScreen,
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
  setAttachmentPoints,
} from '@utils';
import { getMolfile } from '@utils/formats';

const CANVAS_CLICK_X = 500;
const CANVAS_CLICK_Y = 500;

async function selectMultipleGroup(
  page: Page,
  text: string,
  dataName: string,
  valueRepeatCount: string,
  buttonToClick?: 'Apply' | 'Cancel',
) {
  await page.locator('span').filter({ hasText: text }).click();
  await page.getByRole('option', { name: dataName }).click();
  await page.getByLabel('Repeat count').fill(valueRepeatCount);
  if (buttonToClick === 'Apply') {
    await pressButton(page, 'Apply');
  } else if (buttonToClick === 'Cancel') {
    await pressButton(page, 'Cancel');
  }
}

test.describe('Multiple S-Group tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1506
      Description: The brackets are rendered correctly around Atom
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnAtom(page, 'C', 3);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88', 'Apply');
  });

  test('Brackets rendering for bond', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1506
      Description: The brackets are rendered correctly around Bond
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnBond(page, BondType.SINGLE, 3);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88', 'Apply');
  });

  test('Brackets rendering for whole s-group structure', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1506
      Description: The brackets are rendered correctly around whole structure
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88', 'Apply');
  });

  test('Brackets rendering for whole s-group structure even with attachment points', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await pressButton(page, 'Apply');
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88', 'Apply');
  });

  test('Edit S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1520
      Description: User is able to edit the Multiple S-group.
    */
    await openFileAndAddToCanvas('KET/multiple-group.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnBond(page, BondType.SINGLE, 3, 'right');
    await page.getByText('Edit S-Group...').click();
    await fillFieldByLabel(page, 'Repeat count', '99');
    await pressButton(page, 'Apply');
    await resetCurrentTool(page);
  });

  test('Add atom on Chain with Data S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1521
      Description: User is able to add atom on structure with Multiple S-group.
    */
    await openFileAndAddToCanvas('KET/multiple-group.ket', page);
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
    await openFileAndAddToCanvas('KET/multiple-group.ket', page);
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
    await openFileAndAddToCanvas('KET/multiple-group.ket', page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('delete').click();
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
    await openFileAndAddToCanvas('KET/multiple-group.ket', page);
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
    await openFileAndAddToCanvas('KET/multiple-group.ket', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Cut/Paste structure with Multiple S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1522
      Description: User is able to cut and paste structure with Multiple S-group.
    */
    await openFileAndAddToCanvas('KET/multiple-group.ket', page);
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Save/Open Multiple S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1523
      Description: User is able to save and open structure with Multiple S-group.
    */
    await openFileAndAddToCanvas('KET/multiple-group-data.ket', page);
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

  test('Limit on minimum count', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-16891
      Description: The fragment we previously clicked on is highlighted with two 
      square brackets and displayed next to bracket 1
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '1', 'Apply');
  });

  test('Limit on maximum count', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-16892
      Description: The fragment we previously clicked on is highlighted with two 
      square brackets and displayed next to bracket 200
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '200', 'Apply');
  });

  test('Check validations on limitation (Try add 0 in Repeat count)', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-16893
      Description: 0 is displayed and warning message "must be >=1" on the right under the highlighted red "Repeat count" field
      The field "Repeat count" is empty and is lit in gray, the "Apply" button is not active
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '0');
  });

  test('Check validations on limitation (Try add 201 in Repeat count)', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-16893
      Description: 201 is displayed and warning message "must be <=200" on the right under the highlighted red "Repeat count" field
      The field "Repeat count" is empty and is lit in gray
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '201');
  });

  test('Check validations on limitation (Try add -1 in Repeat count)', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-16893
      Description: -1 is displayed and warning message "must be >=1" on the right under the highlighted red "Repeat count" field
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '-1');
  });

  test('Attachment point inside S-Group brackets', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-16938
      Description: Attachment points should be inside of S-Group
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '200', 'Apply');
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true, secondary: true },
      'Apply',
    );
  });
});
