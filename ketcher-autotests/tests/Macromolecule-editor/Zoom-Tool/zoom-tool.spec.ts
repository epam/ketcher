import { Locator, test, Page, chromium } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  selectRectangleArea,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  selectTool,
  takeEditorScreenshot,
  waitForPageInit,
  moveMouseToTheMiddleOfTheScreen,
  selectClearCanvasTool,
  clickInTheMiddleOfTheScreen,
  MacromoleculesTopPanelButton,
  moveMouseAway,
} from '@utils';
import {
  zoomWithMouseWheel,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';

let page: Page;

test.beforeAll(async ({ browser }) => {
  let sharedContext;
  try {
    sharedContext = await browser.newContext();
  } catch (error) {
    console.error('Error on creation browser context:', error);
    console.log('Restarting browser...');
    await browser.close();
    browser = await chromium.launch();
    sharedContext = await browser.newContext();
  }

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
  const cntxt = page.context();
  await page.close();
  await cntxt.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
  // await browser.close();
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

  test('Zoom In & Out monomer with menu buttons', async () => {
    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomIn, page);
    await selectTool(MacromoleculesTopPanelButton.ZoomIn, page);
    await selectTool(MacromoleculesTopPanelButton.ZoomIn, page);
    await selectTool(MacromoleculesTopPanelButton.ZoomIn, page);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomReset, page);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomOut, page);
    await selectTool(MacromoleculesTopPanelButton.ZoomOut, page);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
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
    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomIn, page);
    await selectTool(MacromoleculesTopPanelButton.ZoomIn, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectSingleBondTool(page);
    await peptide.hover();
    await takeEditorScreenshot(page);

    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomReset, page);
    await clickInTheMiddleOfTheScreen(page);
    await peptide.hover();
    await takeEditorScreenshot(page);

    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomOut, page);
    await selectTool(MacromoleculesTopPanelButton.ZoomOut, page);
    await clickInTheMiddleOfTheScreen(page);
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
    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomIn, page);
    await selectTool(MacromoleculesTopPanelButton.ZoomIn, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectSingleBondTool(page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);
    await page.mouse.up();
    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomReset, page);
    await clickInTheMiddleOfTheScreen(page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);
    await page.mouse.up();
    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomOut, page);
    await selectTool(MacromoleculesTopPanelButton.ZoomOut, page);
    await clickInTheMiddleOfTheScreen(page);
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
    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomIn, page);
    await selectTool(MacromoleculesTopPanelButton.ZoomIn, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takeEditorScreenshot(page);

    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomReset, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takeEditorScreenshot(page);

    await page.getByTestId('zoom-selector').click();
    await selectTool(MacromoleculesTopPanelButton.ZoomOut, page);
    await selectTool(MacromoleculesTopPanelButton.ZoomOut, page);
    await clickInTheMiddleOfTheScreen(page);
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
