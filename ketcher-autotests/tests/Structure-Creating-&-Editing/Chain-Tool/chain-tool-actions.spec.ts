import { test, expect, Page } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  selectTool,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  LeftPanelButton,
  selectDropdownTool,
  saveToFile,
  receiveFileComparisonData,
  clickOnAtom,
  waitForRender,
} from '@utils';
import { getMolfile } from '@utils/formats';

const DELTA = 200;

async function createSomeStructure(page: Page) {
  const a = 97;
  const b = 79;
  const c = 943;
  const d = 114;
  const e = 844;
  const f = 579;
  const g = 66;
  const h = 611;
  await page.mouse.move(a, b);
  await page.mouse.down();
  await page.mouse.move(c, d);
  await page.mouse.move(e, f);
  await page.mouse.move(g, h);
  await page.mouse.up();
}

test.describe('Chain Tool verification', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Chain Tool - UI verification', async ({ page }) => {
    // Test case: EPMLSOPKET-1474
    // Verify the icon and the tooltip of the Chain Tool button
    const button = page.getByTestId('chain');
    await expect(button).toHaveAttribute('title', 'Chain');
  });

  test('Chain tool - Select atom', async ({ page }) => {
    // Test case: EPMLSOPKET-1477
    // Verify selecting atom on chain and change it into other one
    await selectTool(LeftPanelButton.Chain, page);
    const center = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(center.x + DELTA, center.y, page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await clickOnAtom(page, 'C', 0);
    await page.keyboard.press('n');
  });

  test('Chain tool - Save and render', async ({ page }) => {
    // Test case: EPMLSOPKET-1479
    // Saving open .ket file with collection of chains in a .mol file
    await openFileAndAddToCanvas('KET/chains.ket', page);
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile('Molfiles-V2000/chains-expected-file.mol', expectedFile);
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/chains-expected-file.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Chain tool - edit saved file', async ({ page }) => {
    // Moving and deleting part of the chain on the canvas
    const a = 512;
    const b = 185;
    const c = 224;
    const d = 128;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chains-expected-file.mol',
      page,
    );
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await createSomeStructure(page);
    await waitForRender(page, async () => {
      await page.mouse.click(a, b);
      await dragMouseTo(c, d, page);
      await page.keyboard.press('Delete');
    });
  });

  test('Chain Tool - order of Hydrogen symbol in abbreviation of the atoms when adding them to the structure', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16949
    // Verify selecting and chaning atom type on chain
    const a = 2;
    const b = 4;
    const c = 6;
    await selectTool(LeftPanelButton.Chain, page);
    const center = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(center.x + DELTA, center.y, page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'C', 0);
    await clickOnAtom(page, 'C', a);
    await clickOnAtom(page, 'C', b);
    await clickOnAtom(page, 'C', c);
    await page.keyboard.up('Shift');
    await page.keyboard.press('p');
  });
});
