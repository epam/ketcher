/* eslint-disable no-magic-numbers */
import { expect, Page, test } from '@playwright/test';
import {
  AtomButton,
  BondType,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  clickOnBond,
  copyAndPaste,
  cutAndPaste,
  LeftPanelButton,
  openFileAndAddToCanvas,
  pressButton,
  receiveFileComparisonData,
  resetCurrentTool,
  RingButton,
  saveToFile,
  screenshotBetweenUndoRedo,
  selectAtomInToolbar,
  selectLeftPanelButton,
  selectRingButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { getBondByIndex } from '@utils/canvas/bonds';
import { getMolfile } from '@utils/formats';
import { SGroupRepeatPattern } from '@utils/sgroup';

const CANVAS_CLICK_X = 500;
const CANVAS_CLICK_Y = 500;

async function selectSruPolymer(
  page: Page,
  text: string,
  dataName: string,
  polymerLabel: string,
  repeatPattern: SGroupRepeatPattern,
) {
  await page.locator('span').filter({ hasText: text }).click();
  await page.getByRole('option', { name: dataName }).click();
  await page.getByLabel('Polymer label').fill(polymerLabel);
  await page
    .locator('label')
    .filter({ hasText: 'Repeat Pattern' })
    .locator('span')
    .nth(1)
    .click();
  await page.getByRole('option', { name: repeatPattern }).click();
  await pressButton(page, 'Apply');
}

async function selectRepeatPattern(
  page: Page,
  repeatPattern: SGroupRepeatPattern,
) {
  await page
    .getByRole('button', { name: SGroupRepeatPattern.HeadToTail })
    .click();
  await page.getByRole('option', { name: repeatPattern }).click();
  await pressButton(page, 'Apply');
}

test.describe('SRU Polymer tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1529
      Description: The brackets are rendered correctly around Atom
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnAtom(page, 'C', 3);
    await selectSruPolymer(
      page,
      'Data',
      'SRU Polymer',
      'A',
      SGroupRepeatPattern.HeadToTail,
    );
  });

  test('Brackets rendering for bond', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1529
      Description: The brackets are rendered correctly around Bond
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnBond(page, BondType.SINGLE, 3);
    await selectSruPolymer(
      page,
      'Data',
      'SRU Polymer',
      'A',
      SGroupRepeatPattern.HeadToTail,
    );
  });

  test('Brackets rendering for whole structure', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1529
      Description: The brackets are rendered correctly around whole structure
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectSruPolymer(
      page,
      'Data',
      'SRU Polymer',
      'A',
      SGroupRepeatPattern.HeadToTail,
    );
  });

  test('Connection of labels "Head-to-tail"', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1530
      Description: No connection label should be present at the right-top side of the brackets when the
      'Head-to-tail' connection type is opened.
    */
    await openFileAndAddToCanvas('sru-polymer.mol', page);
  });

  test('Connection of labels "Head-to-head"', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1530
      Description: The 'hh' connection label should be present at the right-top side of the brackets when the
      'Head-to-head' connection type is selected.
    */
    await openFileAndAddToCanvas('sru-polymer.mol', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Edit S-Group...').click();
    await selectRepeatPattern(page, SGroupRepeatPattern.HeadToHead);
  });

  test('Connection of labels "Either unknown"', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1530
      Description: The 'eu' connection label should be present at the right-top side of the brackets when the
      'Either unknown' connection type is selected.
    */
    await openFileAndAddToCanvas('sru-polymer.mol', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Edit S-Group...').click();
    await selectRepeatPattern(page, SGroupRepeatPattern.EitherUnknown);
  });

  test('Edit SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1531
      Description: The 'eu' connection label should be present at the right-top side of the brackets when the
      'Either unknown' connection type is selected. And 'n' letter changes to 'A'
    */
    const polymerLabel = 'A';
    await openFileAndAddToCanvas('sru-polymer.mol', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Edit S-Group...').click();
    await page.getByLabel('Polymer label').fill(polymerLabel);
    await selectRepeatPattern(page, SGroupRepeatPattern.EitherUnknown);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+z');
  });

  test('Add atom on Chain with SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1532
      Description: User is able to add atom on structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas('sru-polymer.mol', page);
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnAtom(page, 'C', 3);
    await resetCurrentTool(page);
  });

  test('Delete and Undo/Redo atom on Chain with SRU polymer S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1532
      Description: User is able to delete and undo/redo atom on structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas('sru-polymer.mol', page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Delete whole Chain with SRU polymer S-Group and Undo/Redo', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1532
      Description: User is able to delete whole Chain with SRU polymer S-Group and undo/redo.
    */
    await openFileAndAddToCanvas('sru-polymer.mol', page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Add Template on Chain with SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1532
      Description: User is able to add Template on structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas('sru-polymer.mol', page);
    await selectRingButton(RingButton.Benzene, page);
    await clickOnAtom(page, 'C', 3);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Add R-Group Label and Undo/Redo on Chain with SRU polymer S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1532
      Description: User is able to add R-Group Label and Undo/Redo on structure with SRU polymer S-group.
    */
    const rGroupName = 'R12';
    await openFileAndAddToCanvas('sru-polymer.mol', page);
    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    await clickOnAtom(page, 'C', 3);
    await page.getByRole('button', { name: rGroupName }).click();
    await pressButton(page, 'Apply');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Copy/Paste structure with SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1535
      Description: User is able to copy and paste structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas('sru-polymer.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Cut/Paste structure with SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1535
      Description: User is able to cut and paste structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas('sru-polymer.mol', page);
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Save/Open SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1536
      Description: User is able to save and open structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas('KET/sru-polymer-data.ket', page);
    const expectedFile = await getMolfile(page);
    await saveToFile('sru-polymer-data-expected.mol', expectedFile);
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/sru-polymer-data-expected.mol',
        metaDataIndexes: METADATA_STRING_INDEX,
      });
    expect(molFile).toEqual(molFileExpected);
  });
});
