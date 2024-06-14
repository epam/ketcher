import { Page, test } from '@playwright/test';
import {
  readFileContents,
  waitForPageInit,
  turnOnMacromoleculesEditor,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  addFragment,
  selectRectangleArea,
  openFileAndAddToCanvasMacro,
  dragMouseTo,
  waitForRender,
  clickInTheMiddleOfTheScreen,
} from '@utils';

const fileName = 'KET/alanine-monomers-bonded.ket';

async function shiftStructure(page: Page) {
  const startX = 100;
  const startY = 100;
  const endX = 800;
  const endY = 750;
  const toShiftToCoordinates = 400;

  await selectRectangleArea(page, startX, startY, endX, endY);
  const alanine = await page
    .getByText('A', { exact: true })
    .locator('..')
    .first();
  await alanine.hover();
  await dragMouseTo(toShiftToCoordinates, toShiftToCoordinates, page);
}

test.describe('addFragment', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await openFileAndAddToCanvasMacro(fileName, page);
    await shiftStructure(page);
  });

  test.afterEach(async ({ page }) => {
    await page.mouse.move(0, 0);
    await takeEditorScreenshot(page);
  });

  test('mol with two monomers bonded', async ({ page }) => {
    const fileContents = await readFileContents(
      'tests/test-data/Molfiles-V3000/alanine-monomers-bonded-expected.mol',
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await addFragment(page, fileContents),
    );
    const numberOfPressZoomOut = 6;
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
  });

  test('ket with two monomers bonded', async ({ page }) => {
    const fileContents = await readFileContents(`tests/test-data/${fileName}`);
    await waitForSpinnerFinishedWork(
      page,
      async () => await addFragment(page, fileContents),
    );
    const numberOfPressZoomOut = 6;
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
  });
});
