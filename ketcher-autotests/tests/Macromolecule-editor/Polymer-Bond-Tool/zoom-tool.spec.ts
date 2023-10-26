import { Locator, test } from '@playwright/test';
import {
  LeftPanelButton,
  addMonomerToCanvas,
  selectRectangleArea,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  selectTool,
  takePageScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

const MONOMER_NAME_TZA = 'C___Cysteine';
const MONOMER_ALIAS_TZA = 'C';

test.describe('Zoom Tool', () => {
  const deltas = { x: 0, y: 200 };
  const peptideCoordinates = { x: 300, y: 300 };
  let peptide: Locator;
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    peptide = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      peptideCoordinates.x,
      peptideCoordinates.y,
      0,
    );
  });

  test('Zoom In & Out monomer with menu buttons', async ({ page }) => {
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await takePageScreenshot(page);

    await selectTool(LeftPanelButton.ZoomReset, page);
    await takePageScreenshot(page);

    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectTool(LeftPanelButton.ZoomOut, page);
    await takePageScreenshot(page);
  });

  test('Zoom In & Out monomer with mouse wheel', async ({ page }) => {
    await page.mouse.wheel(deltas.x, deltas.y);
    await takePageScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await takePageScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await takePageScreenshot(page);
  });

  test('Zoom In & Out attachment points with menu buttons', async ({
    page,
  }) => {
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectSingleBondTool(page);
    await peptide.hover();
    await takePageScreenshot(page);

    await selectTool(LeftPanelButton.ZoomReset, page);
    await peptide.hover();
    await takePageScreenshot(page);

    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectTool(LeftPanelButton.ZoomOut, page);
    await peptide.hover();
    await takePageScreenshot(page);
  });

  test('Zoom In & Out attachment points with mouse wheel', async ({ page }) => {
    await page.mouse.wheel(deltas.x, deltas.y);
    await selectSingleBondTool(page);
    await peptide.hover();
    await takePageScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await takePageScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await takePageScreenshot(page);
  });

  test('Zoom In & Out bond with menu buttons', async ({ page }) => {
    const bondCoordinates = { x: 400, y: 400 };
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectSingleBondTool(page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takePageScreenshot(page);

    await selectTool(LeftPanelButton.ZoomReset, page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takePageScreenshot(page);

    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectTool(LeftPanelButton.ZoomOut, page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takePageScreenshot(page);
  });

  test('Zoom In & Out bond with mouse wheel', async ({ page }) => {
    const bondCoordinates = { x: 400, y: 400 };
    await page.mouse.wheel(deltas.x, deltas.y);
    await selectSingleBondTool(page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takePageScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takePageScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takePageScreenshot(page);
  });

  test('Zoom In & Out selection rectangle with menu buttons', async ({
    page,
  }) => {
    const selectionStart = { x: 200, y: 200 };
    const selectionEnd = { x: 400, y: 400 };
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectRectangleSelectionTool(page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takePageScreenshot(page);

    await selectTool(LeftPanelButton.ZoomReset, page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takePageScreenshot(page);

    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takePageScreenshot(page);
  });

  test('Zoom In & Out selection rectangle with mouse wheel', async ({
    page,
  }) => {
    const selectionStart = { x: 200, y: 200 };
    const selectionEnd = { x: 400, y: 400 };
    await page.mouse.wheel(deltas.x, deltas.y);
    await selectRectangleSelectionTool(page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takePageScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takePageScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takePageScreenshot(page);
  });
});
