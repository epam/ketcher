import { Peptides } from '@constants/monomers/Peptides';
import { Page, test } from '@playwright/test';
import {
  readFileContents,
  waitForPageInit,
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  addFragment,
  selectRectangleArea,
  openFileAndAddToCanvasMacro,
  dragMouseTo,
  clickInTheMiddleOfTheScreen,
  selectZoomOutTool,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopLeftToolbar';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

const fileName = 'KET/alanine-monomers-bonded.ket';

async function shiftStructure(page: Page) {
  const startX = 100;
  const startY = 100;
  const endX = 800;
  const endY = 750;
  const toShiftToCoordinates = 400;

  await selectRectangleArea(page, startX, startY, endX, endY);
  const alanine = getMonomerLocator(page, Peptides.A).first();
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

  test('mol with two monomers bonded', async ({ page }) => {
    const fileContents = await readFileContents(
      'tests/test-data/Molfiles-V3000/alanine-monomers-bonded-expected.mol',
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await addFragment(page, fileContents),
    );
    const numberOfPressZoomOut = 6;
    await selectZoomOutTool(page, numberOfPressZoomOut);
    await page.mouse.move(0, 0);
    await takeEditorScreenshot(page);
  });

  test('ket with two monomers bonded', async ({ page }) => {
    const fileContents = await readFileContents(`tests/test-data/${fileName}`);
    await waitForSpinnerFinishedWork(
      page,
      async () => await addFragment(page, fileContents),
    );
    const numberOfPressZoomOut = 6;
    await selectZoomOutTool(page, numberOfPressZoomOut);
    await clickInTheMiddleOfTheScreen(page);
    await page.mouse.move(0, 0);
    await takeEditorScreenshot(page);
  });
});
