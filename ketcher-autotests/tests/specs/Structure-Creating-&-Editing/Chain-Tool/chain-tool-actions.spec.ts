import { test, expect } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  clickOnAtom,
  clickOnBond,
  BondType,
  MolFileFormat,
  deleteByKeyboard,
  keyboardPressOnCanvas,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

const DELTA = 200;

test.describe('Chain Tool verification', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Chain Tool - UI verification', async ({ page }) => {
    // Test case: EPMLSOPKET-1474
    // Verify the icon and the tooltip of the Chain Tool button
    const button = LeftToolbar(page).chainButton;
    await expect(button).toHaveAttribute('title', 'Chain');
    await takeEditorScreenshot(page);
  });

  test('Chain tool - Select atom', async ({ page }) => {
    // Test case: EPMLSOPKET-1477
    // Verify selecting atom on chain and change it into other one
    await LeftToolbar(page).chain();
    const center = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(center.x + DELTA, center.y, page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await clickOnAtom(page, 'C', 0);
    await keyboardPressOnCanvas(page, 'n');
    await takeEditorScreenshot(page);
  });

  test('Chain tool - Save and render', async ({ page }) => {
    // Test case: EPMLSOPKET-1479
    // Saving open .ket file with collection of chains in a .mol file
    await openFileAndAddToCanvas(page, 'KET/chains.ket');
    await verifyFileExport(
      page,
      'Molfiles-V2000/chains-expected-file.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Chain tool - edit saved file', async ({ page }) => {
    // Moving and deleting part of the chain on the canvas
    const bondNumber = 3;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chains-expected-file.mol',
    );
    await clickOnBond(page, BondType.SINGLE, bondNumber);
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Chain Tool - order of Hydrogen symbol in abbreviation of the atoms when adding them to the structure', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16949
    // Verify selecting and changing atom type on chain
    const bondNumber = 2;
    const bondNumber1 = 4;
    const bondNumber2 = 6;
    await LeftToolbar(page).chain();
    const center = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(center.x + DELTA, center.y, page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'C', 0);
    await clickOnAtom(page, 'C', bondNumber);
    await clickOnAtom(page, 'C', bondNumber1);
    await clickOnAtom(page, 'C', bondNumber2);
    await page.keyboard.up('Shift');
    await page.keyboard.press('p');
    await takeEditorScreenshot(page);
  });
});
