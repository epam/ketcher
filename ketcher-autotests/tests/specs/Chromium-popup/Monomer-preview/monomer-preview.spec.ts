/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { openFileAndAddToCanvasAsNewProjectMacro } from '@utils/files/readFile';
import {
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils/index';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

let page: Page;
test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ FlexCanvas: _ }) => {});

async function shiftCanvas(page: Page, xShift: number, yShift: number) {
  await CommonLeftToolbar(page).handTool();
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  await page.mouse.move(x, y);
  await dragMouseTo(x + xShift, y + yShift, page);
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
}

test(`1. Check that additional monomer properties should be added to the monomer preview on canvas (in snake)`, async ({
  SnakeCanvas: _,
}) => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8553
   * Description: Check that additional monomer properties should be added to the monomer preview on canvas (in snake)
   *
   * Case:
   *      1. Open Macromolecules canvas - Snake mode
   *      2. Load custom peptide structure from KET file to the canvas
   *      3. Hover the monomer and open the tooltip
   *      4. Verify that the IDT alias is displayed in the tooltip
   *      5. Verify that the AxoLabs alias is displayed in the tooltip
   *      6. Verify that the HELM alias is displayed in the tooltip
   *      7. Verify that the modification types are displayed in the tooltip
   *
   * Version 3.10
   */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Chromium-popup/Monomer-preview/monomer-preview.ket',
  );

  const monomer = getMonomerLocator(page, {});
  await monomer.hover();

  const monomerPreviewTooltip = MonomerPreviewTooltip(page);
  await monomerPreviewTooltip.waitForBecomeVisible();

  expect.soft(await monomerPreviewTooltip.getIDTAliases()).toEqual('test_IDT');
  expect
    .soft(await monomerPreviewTooltip.getAxoLabsAlias())
    .toEqual('test_AxoLabs');
  expect.soft(await monomerPreviewTooltip.getHELMAlias()).toEqual('test_HELM');
  expect
    .soft(await monomerPreviewTooltip.getModificationTypes())
    .toEqual(
      'Natural amino acid, Inversion, N-methylation, Side chain acetylation, Custom modidication',
    );
});
