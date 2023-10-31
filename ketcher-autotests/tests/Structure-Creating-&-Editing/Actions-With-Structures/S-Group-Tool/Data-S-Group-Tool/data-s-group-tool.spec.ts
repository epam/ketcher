/* eslint-disable max-len */
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
  moveMouseToTheMiddleOfTheScreen,
  selectAtomInToolbar,
  AtomButton,
  resetCurrentTool,
  BondType,
  selectRingButton,
  RingButton,
  copyAndPaste,
  cutAndPaste,
  clickOnBond,
  clickOnAtom,
  fillFieldByPlaceholder,
  screenshotBetweenUndoRedo,
  saveToFile,
  waitForPageInit,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getCml, getMolfile } from '@utils/formats';

const CANVAS_CLICK_X = 600;
const CANVAS_CLICK_Y = 600;

async function editSGroupProperties(
  page: Page,
  text: string,
  type: string,
  context: string,
  testValue: string,
) {
  await page.getByText(text).dblclick();
  await pressButton(page, type);
  await page.getByRole('option', { name: context }).click();
  await page.getByLabel('Repeat count').click();
  await page.getByLabel('Repeat count').fill(testValue);
  await pressButton(page, 'Apply');
}

async function selectSGroupProperties(
  page: Page,
  contextName: string,
  optionName: string,
  fieldName: string,
  fieldValue: string,
  radioButton: string,
) {
  await page.keyboard.press('Control+a');
  await selectLeftPanelButton(LeftPanelButton.S_Group, page);
  await pressButton(page, contextName);
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

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Create S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1510
      Description: The Field value appears near bottom right corner of structure.
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await fillFieldByPlaceholder(page, 'Enter name', 'Test');
    await fillFieldByPlaceholder(page, 'Enter value', '33');
    await pressButton(page, 'Apply');
  });

  test('S-Group properties dialog for atom of Benzene ring', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1499
      Description: The 'S-Group Properties' dialog appears when user selects atom.
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnAtom(page, 'C', 3);
  });

  test('S-Group properties dialog for bond of Benzene ring', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1499
      Description: The 'S-Group Properties' dialog appears when user selects bond.
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnBond(page, BondType.SINGLE, 2);
  });

  test('S-Group properties dialog for whole structure of Benzene ring', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1499
      Description: The 'S-Group Properties' dialog appears when user selects whole structure.
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
  });

  test('Edit S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1511
      Description: User is able to edit the Data S-group.
    */
    await openFileAndAddToCanvas('KET/chain-with-name-and-value.ket', page);
    await editSGroupProperties(page, '33', 'Data', 'Multiple group', '1');
  });

  test('Copy/Paste structure with S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1514
      Description: User is able to copy and paste structure with Data S-group.
    */
    await openFileAndAddToCanvas('KET/chain-with-name-and-value.ket', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Cut/Paste structure with S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1514
      Description: User is able to cut and paste structure with Data S-group.
    */
    await openFileAndAddToCanvas('KET/chain-with-name-and-value.ket', page);
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Save/Open S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1517
      Description: User is able to save and open structure with Data S-group.
    */
    await openFileAndAddToCanvas('chain-with-name-and-value.mol', page);
    const expectedFile = await getMolfile(page);
    await saveToFile('chain-with-name-and-value-expected.mol', expectedFile);
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/chain-with-name-and-value-expected.mol',
        metaDataIndexes: METADATA_STRING_INDEX,
      });
    expect(molFile).toEqual(molFileExpected);

    await editSGroupProperties(page, '33', 'Data', 'Multiple group', '8');
  });

  test('Add Data S-Group to atoms of Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1551
      Description: Data S-Group added to all atoms of Chain
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectSGroupProperties(
      page,
      'Fragment',
      'Atom',
      'Test',
      '8',
      'Absolute',
    );
  });

  test('Add Data S-Group to bonds of Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1550
      Description: Data S-Group added to all bonds of Chain
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectSGroupProperties(
      page,
      'Fragment',
      'Atom',
      'Test',
      '8',
      'Absolute',
    );
  });

  test('Add Data S-Group Group context to Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1552
      Description: Data S-Group added to all structure of Chain
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectSGroupProperties(
      page,
      'Fragment',
      'Group',
      'T@#qwer123',
      'Qw@!23#$%',
      'Absolute',
    );
  });

  test('Add Data S-Group Multifragment context to Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-12986
      Description: Data S-Group added to all structure of Chain
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectSGroupProperties(
      page,
      'Fragment',
      'Multifragment',
      'T@#qwer123',
      'Qw@!23#$%',
      'Relative',
    );
  });

  test('Add Data S-Group for the reaction components', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1553
      Description: Data S-Group added to only structures. Not to plus sign and arrow.
    */
    await openFileAndAddToCanvas('KET/reaction-with-arrow-and-plus.ket', page);
    await selectSGroupProperties(
      page,
      'Fragment',
      'Multifragment',
      'T@#qwer123',
      'Qw@!23#$%',
      'Absolute',
    );
    await moveMouseToTheMiddleOfTheScreen(page);
  });

  test('Add Data S-Group for the reaction components with attached radio button', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1553
      Description: Data S-Group attached to only on atoms of structures. Not to plus sign and arrow.
    */
    await openFileAndAddToCanvas('KET/reaction-with-arrow-and-plus.ket', page);
    await selectSGroupProperties(
      page,
      'Fragment',
      'Multifragment',
      'T@#qwer123',
      '8',
      'Attached',
    );
    await moveMouseToTheMiddleOfTheScreen(page);
  });

  test('Edit Data S-Group Field name and Field Value', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1543
      Description: User is able to edit the Data S-group Field name and Field Value.
    */
    await openFileAndAddToCanvas('KET/chain-with-name-and-value.ket', page);
    await selectSGroupProperties(
      page,
      'Fragment',
      'Multifragment',
      'T@#qwer123',
      '8',
      'Attached',
    );
  });

  test('Add atom on Chain with Data S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to add atom on structure with Data S-group.
    */
    await openFileAndAddToCanvas('KET/chain-with-name-and-value.ket', page);
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnAtom(page, 'C', 3);
    await resetCurrentTool(page);
  });

  test('Delete and Undo/Redo atom on Chain with Data S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to delete and undo/redo atom on structure with Data S-group.
    */
    await openFileAndAddToCanvas('KET/chain-with-name-and-value.ket', page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Add R-Group Label and Undo/Redo on Chain with Data S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to add R-Group Label and Undo/Redo on structure with Data S-group.
    */
    await openFileAndAddToCanvas('KET/chain-with-name-and-value.ket', page);
    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    await clickOnAtom(page, 'C', 3);
    await pressButton(page, 'R8');
    await pressButton(page, 'Apply');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Delete whole Chain with Data S-Group and Undo/Redo', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to delete whole Chain with Data S-Group and undo/redo.
    */
    await openFileAndAddToCanvas('KET/chain-with-name-and-value.ket', page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Delete and Undo/Redo using hotkeys atom on Chain with Data S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1513
      Description: User is able to delete and undo/redo by hotkeys atom on structure with Data S-group.
    */
    await openFileAndAddToCanvas('KET/chain-with-name-and-value.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.move(point.x, point.y);
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
  });

  test('Open .mol file with Data S-Group and save it as .cml file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1546
      Description: .mol file opened and saved as .cml file
    */
    await openFileAndAddToCanvas(
      'chain-with-data-s-group-partstructure.mol',
      page,
    );
    const expectedFile = await getCml(page);
    await saveToFile(
      'chain-with-data-s-group-partstructure-expected.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/chain-with-data-s-group-partstructure-expected.cml',
      });
    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Click on atom opens menu with context for atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1549
      Description: Openns S-Group menu with filled context field Atom
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnAtom(page, 'C', 3);
  });

  test('Click on bond opens menu with context for bond', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1549
      Description: Openns S-Group menu with filled context field Bond
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnBond(page, BondType.SINGLE, 3);
  });

  test('Selecting all structure opens menu with context for Fragment', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1549
      Description: Openns S-Group menu with filled context field Bond
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
  });

  test('Hover over created S-Group displays tooltip for it', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8907
      Description: Hover over created S-Group displays tooltip for Benzene ring with Nitrogen atom
    */
    await openFileAndAddToCanvas('KET/benzene-with-data-s-group.ket', page);
    await clickInTheMiddleOfTheScreen(page);
  });
});
