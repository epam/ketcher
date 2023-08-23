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
  BondType,
  selectRingButton,
  RingButton,
  copyAndPaste,
  cutAndPaste,
  clickOnAtom,
  clickOnBond,
  screenshotBetweenUndoRedo,
  saveToFile,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getMolfile } from '@utils/formats';
let point: { x: number; y: number };

async function addNameToSuperatom(
  page: Page,
  fieldLabel: string,
  superatomName: string,
) {
  await page.locator('span').filter({ hasText: 'Data' }).click();
  await page.getByRole('option', { name: 'Superatom' }).click();
  await page.getByLabel(fieldLabel).fill(superatomName);
  await pressButton(page, 'Apply');
}

async function fillFieldByLabel(
  page: Page,
  fieldLabel: string,
  superatomName: string,
) {
  await page.getByLabel(fieldLabel).click();
  await page.getByLabel(fieldLabel).fill(superatomName);
}

async function contractExpandRemoveAbbreviation(
  page: Page,
  superatomName: string,
) {
  point = await getAtomByIndex(page, { label: 'C' }, 3);
  await page.mouse.click(point.x, point.y, { button: 'right' });
  await page.getByText('Contract Abbreviation').click();
  await takeEditorScreenshot(page);
  await page.getByText(superatomName).click({ button: 'right' });
  await page.getByText('Expand Abbreviation').click();
  await takeEditorScreenshot(page);
  await page.mouse.click(point.x, point.y, { button: 'right' });
  await page.getByText('Remove Abbreviation').click();
}

test.describe('Superatom S-Group tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1537
      Description: The brackets are rendered correctly around Atom
    */
    await openFileAndAddToCanvas('Ket/simple-chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnAtom(page, 'C', 3);
    await addNameToSuperatom(page, 'Name', 'Test@!#$%12345');
  });

  test('Brackets rendering for bond', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1537
      Description: The brackets are rendered correctly around Bond
    */
    await openFileAndAddToCanvas('Ket/simple-chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnBond(page, BondType.SINGLE, 3);
    await addNameToSuperatom(page, 'Name', 'Test@!#$%12345');
  });

  test('Brackets rendering for whole structure', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1537
      Description: The brackets are rendered correctly around whole structure
    */
    await openFileAndAddToCanvas('Ket/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await addNameToSuperatom(page, 'Name', 'Test@!#$%12345');
  });

  test('Edit Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1538
      Description: User is able to edit the Superatom S-group.
    */
    const CANVAS_CLICK_X = 570;
    const CANVAS_CLICK_Y = 380;
    await openFileAndAddToCanvas('superatom.mol', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await fillFieldByLabel(page, 'Name', 'Test@!#$%12345');
    await pressButton(page, 'Apply');
  });

  test('Add atom on Chain with Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1539
      Description: User is unable to add atom on structure with Superatom S-group.
      EDIT ABBREVIATION modal appears.
    */
    await openFileAndAddToCanvas('superatom.mol', page);
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnAtom(page, 'C', 3);
  });

  test('Delete atom on Chain with Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1539
      Description: User is unable to delete atom on structure with Superatom S-group.
      EDIT ABBREVIATION modal appears.
    */
    await openFileAndAddToCanvas('superatom.mol', page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickOnAtom(page, 'C', 3);
  });

  test('Delete whole Chain with Superatom S-Group and Undo/Redo', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1539
      Description: User is able to delete whole Chain with Superatom S-Group and undo/redo.
    */
    await openFileAndAddToCanvas('superatom.mol', page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Add Template on Chain with Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1539
      Description: User is unable to add Template on structure with Superatom S-group.
      EDIT ABBREVIATION modal appears.
    */
    await openFileAndAddToCanvas('superatom.mol', page);
    await selectRingButton(RingButton.Benzene, page);
    await clickOnAtom(page, 'C', 3);
  });

  test('Add R-Group Label on Chain with Superatom S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1539
      Description: User is unable to add R-Group Label on structure with SRU polymer S-group.
      EDIT ABBREVIATION modal appears.
    */
    await openFileAndAddToCanvas('superatom.mol', page);
    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    await clickOnAtom(page, 'C', 3);
  });

  test('Check that hotkeys for atoms working after Remove Abbreviation on Chain with Superatom S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-12989
      Description: User is able select atom by hotkey after Remove Abbreviation on Chain with Superatom S-Group.
    */
    await openFileAndAddToCanvas('superatom.mol', page);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 3);
    await pressButton(page, 'Remove Abbreviation');
    await page.keyboard.press('o');
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Copy/Paste structure with Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1540
      Description: User is able to copy and paste structure with Superatom S-group.
    */
    const CANVAS_CLICK_X = 600;
    const CANVAS_CLICK_Y = 600;
    await openFileAndAddToCanvas('superatom.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Cut/Paste structure with Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1540
      Description: User is able to cut and paste structure with Superatom S-group.
    */
    await openFileAndAddToCanvas('superatom.mol', page);
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Save/Open Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1541
      Description: User is able to save and open structure with Superatom S-group.
    */
    await openFileAndAddToCanvas('Ket/superatom-all-chain.ket', page);
    const expectedFile = await getMolfile(page);
    await saveToFile('superatom-all-chain-expected.mol', expectedFile);
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/superatom-all-chain-expected.mol',
        metaDataIndexes: METADATA_STRING_INDEX,
      });
    expect(molFile).toEqual(molFileExpected);
  });

  test('Contract/expand/remove abbreviation on whole Chain structure with Superatom S-group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-12990
      Description: User is able to contract/expand/remove abbreviation on structure with Superatom S-group.
    */
    await openFileAndAddToCanvas('Ket/superatom-all-chain.ket', page);
    await contractExpandRemoveAbbreviation(page, 'Test@!#$%12345');
  });

  test('Atom Contract/expand/remove abbreviation on Chain structure with Superatom S-group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-12991
      Description: User is able to contract/expand/remove abbreviation on atom with Superatom S-group.
    */
    await openFileAndAddToCanvas('Ket/superatom-one-atom-on-chain.ket', page);
    await contractExpandRemoveAbbreviation(page, 'Test@!#$%12345');
  });
});
