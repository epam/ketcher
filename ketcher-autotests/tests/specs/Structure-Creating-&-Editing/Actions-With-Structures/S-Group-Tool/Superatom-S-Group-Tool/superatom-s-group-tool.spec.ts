/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  pressButton,
  BondType,
  clickOnAtom,
  clickOnBond,
  screenshotBetweenUndoRedo,
  waitForPageInit,
  clickOnCanvas,
  MolFileFormat,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SuperatomOption } from '@tests/pages/constants/contextMenu/Constants';
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

async function addQueryComponent(page: Page) {
  await page.locator('span').filter({ hasText: 'Data' }).click();
  await page.getByRole('option', { name: 'Query component' }).click();
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

test.describe('Superatom S-Group tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Brackets rendering for atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1537
      Description: The brackets are rendered correctly around Atom
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();
    await clickOnAtom(page, 'C', 3);
    await addNameToSuperatom(page, 'Name', 'Test@!#$%12345');
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for bond', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1537
      Description: The brackets are rendered correctly around Bond
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();
    await clickOnBond(page, BondType.SINGLE, 3);
    await addNameToSuperatom(page, 'Name', 'Test@!#$%12345');
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for whole structure', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1537
      Description: The brackets are rendered correctly around whole structure
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await addNameToSuperatom(page, 'Name', 'Test@!#$%12345');
    await takeEditorScreenshot(page);
  });

  test('Edit Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1538
      Description: User is able to edit the Superatom S-group.
    */
    const CANVAS_CLICK_X = 570;
    const CANVAS_CLICK_Y = 380;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/superatom.mol');
    await LeftToolbar(page).sGroup();
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await fillFieldByLabel(page, 'Name', 'Test@!#$%12345');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Add atom on Chain with Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1539
      Description: User is unable to add atom on structure with Superatom S-group.
      EDIT ABBREVIATION modal appears.
    */
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/superatom.mol');
    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('Delete atom on Chain with Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1539
      Description: User is unable to delete atom on structure with Superatom S-group.
      EDIT ABBREVIATION modal appears.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/superatom.mol');
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('Delete whole Chain with Superatom S-Group and Undo/Redo', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1539
      Description: User is able to delete whole Chain with Superatom S-Group and undo/redo.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/superatom.mol');
    await selectAllStructuresOnCanvas(page);
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Add Template on Chain with Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1539
      Description: User is unable to add Template on structure with Superatom S-group.
      EDIT ABBREVIATION modal appears.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/superatom.mol');
    await selectRingButton(page, RingButton.Benzene);
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('Add R-Group Label on Chain with Superatom S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1539
      Description: User is unable to add R-Group Label on structure with SRU polymer S-group.
      EDIT ABBREVIATION modal appears.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/superatom.mol');
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('Check that hotkeys for atoms working after Remove Abbreviation on Chain with Superatom S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-12989
      Description: User is able select atom by hotkey after Remove Abbreviation on Chain with Superatom S-Group.
    */
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/superatom.mol');
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', 3);
    await pressButton(page, 'Remove Abbreviation');
    await page.keyboard.press('o');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste structure with Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1540
      Description: User is able to copy and paste structure with Superatom S-group.
    */
    const CANVAS_CLICK_X = 600;
    const CANVAS_CLICK_Y = 600;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/superatom.mol');
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste structure with Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1540
      Description: User is able to cut and paste structure with Superatom S-group.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/superatom.mol');
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Save/Open Superatom S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1541
      Description: User is able to save and open structure with Superatom S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/superatom-all-chain.ket');

    await verifyFileExport(
      page,
      'Molfiles-V2000/superatom-all-chain-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
      [1],
    );
  });

  test('Contract/expand/remove abbreviation on whole Chain structure with Superatom S-group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-12990
      Description: User is able to contract/expand/remove abbreviation on structure with Superatom S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/superatom-all-chain.ket');

    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await ContextMenu(page, point).click(SuperatomOption.ContractAbbreviation);
    await takeEditorScreenshot(page);
    await ContextMenu(page, page.getByText('Test@!#$%12345')).click(
      SuperatomOption.ExpandAbbreviation,
    );
    await takeEditorScreenshot(page);
    await ContextMenu(page, point).click(SuperatomOption.RemoveAbbreviation);

    await takeEditorScreenshot(page);
  });

  test('Atom Contract/expand/remove abbreviation on Chain structure with Superatom S-group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-12991
      Description: User is able to contract/expand/remove abbreviation on atom with Superatom S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/superatom-one-atom-on-chain.ket');

    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await ContextMenu(page, point).click(SuperatomOption.ContractAbbreviation);
    await takeEditorScreenshot(page);
    await ContextMenu(page, page.getByText('Test@!#$%12345')).click(
      SuperatomOption.ExpandAbbreviation,
    );
    await takeEditorScreenshot(page);
    await ContextMenu(page, point).click(SuperatomOption.RemoveAbbreviation);
    await takeEditorScreenshot(page);
  });

  test('Add S-Group properties to structure and atom', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3949
      Description: S-Group added to the structure and represent in .ket file.
      The test is currently not functioning correctly as the bug has not been fixed.
    */
    await openFileAndAddToCanvas(page, 'KET/cyclopropane-and-h2o.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await addNameToSuperatom(page, 'Name', 'Test@!#$%12345');
    await verifyFileExport(
      page,
      'KET/cyclopropane-and-h2o-superatom-expected.ket',
      FileType.KET,
    );
    await takeEditorScreenshot(page);
  });

  test('Add S-Group Query component properties to structure and atom', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3949
      Description: S-Group added to the structure and represent in .ket file.
      The test is currently not functioning correctly as the bug has not been fixed.
    */
    await openFileAndAddToCanvas(page, 'KET/cyclopropane-and-h2o.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await addQueryComponent(page);

    await verifyFileExport(
      page,
      'KET/cyclopropane-and-h2o-query-expected.ket',
      FileType.KET,
    );
    await takeEditorScreenshot(page);
  });
});
