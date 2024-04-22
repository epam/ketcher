import { Locator, test, Page } from '@playwright/test';
import {
  LeftPanelButton,
  addSingleMonomerToCanvas,
  selectRectangleArea,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  selectTool,
  takeEditorScreenshot,
  waitForPageInit,
  moveMouseToTheMiddleOfTheScreen,
  selectClearCanvasTool,
} from '@utils';
import {
  zoomWithMouseWheel,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const sharedContext = await browser.newContext();

  // Reminder: do not pass page as async paramenter to test
  page = await sharedContext.newPage();
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async () => {
  await takeEditorScreenshot(page);
  await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  browser.close();
});

const MONOMER_NAME_TZA = 'C___Cysteine';
const MONOMER_ALIAS_TZA = 'C';
const ZOOM_STEP = 200;
test.describe('Zoom Tool', () => {
  const deltas = { x: 0, y: 200 };
  const peptideCoordinates = { x: 300, y: 300 };
  let peptide: Locator;
  test.beforeEach(async () => {
    // await waitForPageInit(page);
    // await turnOnMacromoleculesEditor(page);
    peptide = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      peptideCoordinates.x,
      peptideCoordinates.y,
      0,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
  });
  /*
  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });
  */
  test('Zoom In & Out monomer with menu buttons', async () => {
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await takeEditorScreenshot(page);

    await selectTool(LeftPanelButton.ZoomReset, page);
    await takeEditorScreenshot(page);

    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectTool(LeftPanelButton.ZoomOut, page);
  });

  test('Zoom In & Out monomer with mouse wheel and CTRL', async () => {
    await page.keyboard.down('Control');
    await page.mouse.wheel(deltas.x, deltas.y);
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
  });

  test('Zoom In & Out attachment points with menu buttons', async () => {
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

  test('Zoom In & Out attachment points with mouse wheel and CTRL', async () => {
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

  test('Zoom In & Out bond with menu buttons', async () => {
    const bondCoordinates = { x: 400, y: 400 };
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectTool(LeftPanelButton.ZoomIn, page);
    await selectSingleBondTool(page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);
    await page.mouse.up();
    await selectTool(LeftPanelButton.ZoomReset, page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);
    await page.mouse.up();
    await selectTool(LeftPanelButton.ZoomOut, page);
    await selectTool(LeftPanelButton.ZoomOut, page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
  });

  test('Zoom In & Out bond with mouse wheel and CTRL', async () => {
    await page.keyboard.down('Control');
    const bondCoordinates = { x: 400, y: 400 };
    await page.mouse.wheel(deltas.x, deltas.y);
    await selectSingleBondTool(page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);
    await page.mouse.up();
    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);
    await page.mouse.up();
    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
  });

  test('Zoom In & Out selection rectangle with menu buttons', async () => {
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

  test('Zoom In & Out selection rectangle with mouse wheel and CTRL', async () => {
    const selectionStart = { x: 200, y: 200 };
    const selectionEnd = { x: 800, y: 800 };
    await zoomWithMouseWheel(page, ZOOM_STEP);
    await selectRectangleSelectionTool(page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, -ZOOM_STEP);
    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, -ZOOM_STEP);
  });

  test('Scroll canvas by mouse wheel', async () => {
    await takeEditorScreenshot(page);
    const deltaX = 900;
    const deltaY = 750;

    await page.mouse.wheel(deltaX, deltaY);
  });

  test('Scroll canvas horizontally with Shift pressed', async () => {
    const wheelDelta = 100;

    await page.keyboard.down('Shift');
    await page.mouse.wheel(0, wheelDelta);
    await page.keyboard.up('Shift');
  });
});
