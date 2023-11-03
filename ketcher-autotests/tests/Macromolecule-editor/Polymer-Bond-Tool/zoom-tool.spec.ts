import { Locator, test } from '@playwright/test';
import {
  LeftPanelButton,
  addMonomerToCanvas,
  selectRectangleArea,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  selectTool,
  takeEditorScreenshot,
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

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Zoom In & Out monomer with menu buttons', async ({ page }) => {
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await takeEditorScreenshot(page);

    await selectTool(LeftPanelButton.ZoomReset, page);
    await takeEditorScreenshot(page);

    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectTool(LeftPanelButton.ZoomOut, page);
  });

  test('Zoom In & Out monomer with mouse wheel and CTRL', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.mouse.wheel(deltas.x, deltas.y);
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
  });

  test('Zoom In & Out attachment points with menu buttons', async ({
    page,
  }) => {
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectSingleBondTool(page);
    await peptide.hover();
    await takeEditorScreenshot(page);

    await selectTool(LeftPanelButton.ZoomReset, page);
    await peptide.hover();
    await takeEditorScreenshot(page);

    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectTool(LeftPanelButton.ZoomOut, page);
    await peptide.hover();
  });

  test('Zoom In & Out attachment points with mouse wheel and CTRL', async ({
    page,
  }) => {
    await page.keyboard.down('Control');
    await page.mouse.wheel(deltas.x, deltas.y);
    await selectSingleBondTool(page);
    await peptide.hover();
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
  });

  test('Zoom In & Out bond with menu buttons', async ({ page }) => {
    const bondCoordinates = { x: 400, y: 400 };
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectSingleBondTool(page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);

    await selectTool(LeftPanelButton.ZoomReset, page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);

    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectTool(LeftPanelButton.ZoomOut, page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
  });

  test('Zoom In & Out bond with mouse wheel and CTRL', async ({ page }) => {
    await page.keyboard.down('Control');
    const bondCoordinates = { x: 400, y: 400 };
    await page.mouse.wheel(deltas.x, deltas.y);
    await selectSingleBondTool(page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
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
    await takeEditorScreenshot(page);

    await selectTool(LeftPanelButton.ZoomReset, page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takeEditorScreenshot(page);

    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
  });

  test('Zoom In & Out selection rectangle with mouse wheel and CTRL', async ({
    page,
  }) => {
    await page.keyboard.down('Control');
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
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
  });

  test('Scroll canvas by mouse wheel', async ({ page }) => {
    await takeEditorScreenshot(page);
    const deltaX = 900;
    const deltaY = 750;

    await page.mouse.wheel(deltaX, deltaY);
  });

  test('Scroll canvas horizontally with `Shift` pressed', async ({ page }) => {
    const wheelDelta = 100;

    await page.keyboard.down('Shift');
    await page.mouse.wheel(0, wheelDelta);
    await page.keyboard.up('Shift');
  });
});
