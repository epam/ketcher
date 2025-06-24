/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  pressButton,
  moveMouseToTheMiddleOfTheScreen,
  resetCurrentTool,
  BondType,
  copyAndPaste,
  cutAndPaste,
  clickOnBond,
  clickOnAtom,
  fillFieldByPlaceholder,
  screenshotBetweenUndoRedo,
  waitForPageInit,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  MolFileFormat,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';

const CANVAS_CLICK_X = 600;
const CANVAS_CLICK_Y = 600;

async function editSGroupProperties(
  page: Page,
  text: string,
  context: string,
  testValue: string,
) {
  await page.getByText(text).dblclick();
  await page.getByTestId('s-group-type-input-span').click();
  await page.getByRole('option', { name: context }).click();
  await page.getByLabel('Repeat count').click();
  await page.getByLabel('Repeat count').fill(testValue);
  await pressButton(page, 'Apply');
}

async function selectSGroupProperties(
  page: Page,
  optionName: string,
  fieldName: string,
  fieldValue: string,
  radioButton: string,
) {
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).sGroup();
  await page.getByTestId('context-input-span').click();
  // await pressButton(page, contextName);
  await page.getByRole('option', { name: optionName }).click();
  await page.getByPlaceholder('Enter name').fill(fieldName);
  await page.getByPlaceholder('Enter value').fill(fieldValue);
  await page.getByText(radioButton).click();
  await pressButton(page, 'Apply');
}

test.describe('Data S-Group tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Create S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1510
      Description: The Field value appears near bottom right corner of structure.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await fillFieldByPlaceholder(page, 'Enter name', 'Test');
    await fillFieldByPlaceholder(page, 'Enter value', '33');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('S-Group properties dialog for atom of Benzene ring', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1499
      Description: The 'S-Group Properties' dialog appears when user selects atom.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await LeftToolbar(page).sGroup();
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('S-Group properties dialog for bond of Benzene ring', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1499
      Description: The 'S-Group Properties' dialog appears when user selects bond.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await LeftToolbar(page).sGroup();
    await clickOnBond(page, BondType.SINGLE, 2);
    await takeEditorScreenshot(page);
  });

  test('S-Group properties dialog for whole structure of Benzene ring', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1499
      Description: The 'S-Group Properties' dialog appears when user selects whole structure.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await takeEditorScreenshot(page);
  });

  test('Edit S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1511
      Description: User is able to edit the Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await editSGroupProperties(page, '33', 'Multiple group', '1');
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste structure with S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1514
      Description: User is able to copy and paste structure with Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste structure with S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1514
      Description: User is able to cut and paste structure with Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Save/Open S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1517
      Description: User is able to save and open structure with Data S-group.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-name-and-value.mol',
    );

    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-name-and-value-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
      [1],
    );
  });

  test('Add Data S-Group to atoms of Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1551
      Description: Data S-Group added to all atoms of Chain
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectSGroupProperties(page, 'Atom', 'Test', '8', 'Absolute');
    await takeEditorScreenshot(page);
  });

  test('Add Data S-Group to bonds of Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1550
      Description: Data S-Group added to all bonds of Chain
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectSGroupProperties(page, 'Atom', 'Test', '8', 'Absolute');
    await takeEditorScreenshot(page);
  });

  test('Add Data S-Group Group context to Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1552
      Description: Data S-Group added to all structure of Chain
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectSGroupProperties(
      page,
      'Group',
      'T@#qwer123',
      'Qw@!23#$%',
      'Absolute',
    );
    await takeEditorScreenshot(page);
  });

  test('Add Data S-Group Multifragment context to Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-12986
      Description: Data S-Group added to all structure of Chain
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectSGroupProperties(
      page,
      'Multifragment',
      'T@#qwer123',
      'Qw@!23#$%',
      'Relative',
    );
    await takeEditorScreenshot(page);
  });

  test('Add Data S-Group for the reaction components', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1553
      Description: Data S-Group added to only structures. Not to plus sign and arrow.
    */
    await openFileAndAddToCanvas(page, 'KET/reaction-with-arrow-and-plus.ket');
    await selectSGroupProperties(
      page,
      'Multifragment',
      'T@#qwer123',
      'Qw@!23#$%',
      'Absolute',
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Add Data S-Group for the reaction components with attached radio button', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1553
      Description: Data S-Group attached to only on atoms of structures. Not to plus sign and arrow.
    */
    await openFileAndAddToCanvas(page, 'KET/reaction-with-arrow-and-plus.ket');
    await selectSGroupProperties(
      page,
      'Multifragment',
      'T@#qwer123',
      '8',
      'Attached',
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Edit Data S-Group Field name and Field Value', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1543
      Description: User is able to edit the Data S-group Field name and Field Value.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await selectSGroupProperties(
      page,
      'Multifragment',
      'T@#qwer123',
      '8',
      'Attached',
    );
    await takeEditorScreenshot(page);
  });

  test('Add atom on Chain with Data S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to add atom on structure with Data S-group.
    */
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnAtom(page, 'C', 3);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Delete and Undo/Redo atom on Chain with Data S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to delete and undo/redo atom on structure with Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Add R-Group Label and Undo/Redo on Chain with Data S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to add R-Group Label and Undo/Redo on structure with Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await clickOnAtom(page, 'C', 3);
    await pressButton(page, 'R8');
    await pressButton(page, 'Apply');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Delete whole Chain with Data S-Group and Undo/Redo', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to delete whole Chain with Data S-Group and undo/redo.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await selectAllStructuresOnCanvas(page);
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Delete and Undo/Redo using hotkeys atom on Chain with Data S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1513
      Description: User is able to delete and undo/redo by hotkeys atom on structure with Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    const point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.move(point.x, point.y);
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Open .mol file with Data S-Group and save it as .cml file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1546
      Description: .mol file opened and saved as .cml file
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V3000/chain-with-data-s-group-partstructure.mol',
    );

    await verifyFileExport(
      page,
      'CML/chain-with-data-s-group-partstructure-expected.cml',
      FileType.CML,
    );
    await takeEditorScreenshot(page);
  });

  test('Click on atom opens menu with context for atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1549
      Description: Openns S-Group menu with filled context field Atom
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('Click on bond opens menu with context for bond', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1549
      Description: Openns S-Group menu with filled context field Bond
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();
    await clickOnBond(page, BondType.SINGLE, 3);
    await takeEditorScreenshot(page);
  });

  test('Selecting all structure opens menu with context for Fragment', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1549
      Description: Openns S-Group menu with filled context field Bond
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await takeEditorScreenshot(page);
  });

  test('Hover over created S-Group displays tooltip for it', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8907
      Description: Hover over created S-Group displays tooltip for Benzene ring with Nitrogen atom
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-with-data-s-group.ket');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Add S-Group properties to structure and atom', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3949
      Description: S-Group added to the structure and represent in .ket file.
      The test is currently not functioning correctly as the bug has not been fixed.
    */
    await openFileAndAddToCanvas(page, 'KET/cyclopropane-and-h2o.ket');
    await selectSGroupProperties(
      page,
      'Multifragment',
      'T@#qwer123',
      '8',
      'Absolute',
    );

    await verifyFileExport(
      page,
      'KET/cyclopropane-and-h2o-expected.ket',
      FileType.KET,
    );
    await takeEditorScreenshot(page);
  });
});
