import { Locator, test, Page, chromium } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  selectRectangleArea,
  selectRectangleSelectionTool,
  takeEditorScreenshot,
  waitForPageInit,
  moveMouseToTheMiddleOfTheScreen,
  selectClearCanvasTool,
  clickInTheMiddleOfTheScreen,
  moveMouseAway,
  selectMacroBond,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  selectFlexLayoutModeTool,
  resetZoomLevelToDefault,
  ZoomOutByKeyboard,
  ZoomInByKeyboard,
  selectZoomInTool,
  selectZoomReset,
  selectZoomOutTool,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import {
  zoomWithMouseWheel,
  turnOnMacromoleculesEditor,
  waitForMonomerPreview,
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
  await resetZoomLevelToDefault(page);
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
    const zoomInCount = 4;
    await selectZoomInTool(page, zoomInCount);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectZoomReset(page);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    const zoomOutCount = 2;
    await selectZoomOutTool(page, zoomOutCount);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Zoom In & Out monomer with mouse wheel and CTRL', async () => {
    await page.keyboard.down('Control');
    await page.mouse.wheel(deltas.x, deltas.y);
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);

    await takeEditorScreenshot(page);
  });

  test('Zoom In & Out attachment points with menu buttons', async () => {
    const zoomInCount = 2;
    await selectZoomInTool(page, zoomInCount);
    await clickInTheMiddleOfTheScreen(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await peptide.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);

    await selectZoomReset(page);
    await clickInTheMiddleOfTheScreen(page);
    await peptide.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);

    const zoomOutCount = 2;
    await selectZoomOutTool(page, zoomOutCount);
    await clickInTheMiddleOfTheScreen(page);
    await peptide.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Zoom In & Out attachment points with mouse wheel and CTRL', async () => {
    await page.keyboard.down('Control');
    await page.mouse.wheel(deltas.x, deltas.y);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await peptide.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);

    await page.mouse.wheel(deltas.x, -deltas.y);
    await peptide.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Zoom In & Out bond with menu buttons', async () => {
    const bondCoordinates = { x: 400, y: 400 };
    const zoomInCount = 2;
    await selectZoomInTool(page, zoomInCount);
    await clickInTheMiddleOfTheScreen(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);
    await page.mouse.up();
    await selectZoomReset(page);
    await clickInTheMiddleOfTheScreen(page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);
    await takeEditorScreenshot(page);
    await page.mouse.up();
    const zoomOutCount = 2;
    await selectZoomOutTool(page, zoomOutCount);
    await clickInTheMiddleOfTheScreen(page);
    await peptide.hover();
    await page.mouse.down();
    await page.mouse.move(bondCoordinates.x, bondCoordinates.y);

    await takeEditorScreenshot(page);
  });

  test('Zoom In & Out bond with mouse wheel and CTRL', async () => {
    await page.keyboard.down('Control');
    const bondCoordinates = { x: 400, y: 400 };
    await page.mouse.wheel(deltas.x, deltas.y);
    await selectMacroBond(page, MacroBondTool.SINGLE);
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

    await takeEditorScreenshot(page);
  });

  test('Zoom In & Out selection rectangle with menu buttons', async () => {
    const selectionStart = { x: 200, y: 200 };
    const selectionEnd = { x: 400, y: 400 };
    const zoomInCount = 2;
    await selectZoomInTool(page, zoomInCount);
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

    await selectZoomReset(page);
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );
    await takeEditorScreenshot(page);

    const zoomOutCount = 2;
    await selectZoomOutTool(page, zoomOutCount);
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleArea(
      page,
      selectionStart.x,
      selectionStart.y,
      selectionEnd.x,
      selectionEnd.y,
    );

    await takeEditorScreenshot(page);
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

    await takeEditorScreenshot(page);
  });

  test('Scroll canvas by mouse wheel', async () => {
    await takeEditorScreenshot(page);
    const deltaX = 900;
    const deltaY = 750;

    await page.mouse.wheel(deltaX, deltaY);

    await takeEditorScreenshot(page);
  });

  test('Scroll canvas horizontally with Shift pressed', async () => {
    const wheelDelta = 100;

    await page.keyboard.down('Shift');
    await page.mouse.wheel(0, wheelDelta);
    await page.keyboard.up('Shift');

    await takeEditorScreenshot(page);
  });

  test('Verify that when zooming in/zooming out by buttons, the zoom is relative to the top left corner of the most top and left monomer in the sequence (Flex mode)', async () => {
    /*
     *  Test case: https://github.com/epam/ketcher/issues/5590
     *  Description: Verify that when zooming in/zooming out by buttons, the zoom is relative to the top left
     *               corner of the most top and left monomer in the sequence (in Flex mode)
     *  Case:
     *        1. Load canvas with monomer chains
     *        2. Take screenshot to witness initial state
     *        3. Zoom In using button 5 times
     *        4. Take screenshot to witness the result
     *        5. Reset Zoom to initial
     *        6. Zoom Out using button 5 times
     *        7. Take screenshot to witness the result
     */
    await selectClearCanvasTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{G.F.E.D.C.A}|PEPTIDE2{M.L.K.I.H}|PEPTIDE3{Q.P.O.N}|PEPTIDE4{T.S.R}|PEPTIDE5{V.U}|PEPTIDE6{W}$$$$V2.0',
    );
    await takeEditorScreenshot(page);

    const numberOfZooms = 5;
    await selectZoomInTool(page, numberOfZooms);
    await takeEditorScreenshot(page);

    await selectZoomReset(page);
    await selectZoomOutTool(page, numberOfZooms);
    await takeEditorScreenshot(page);
  });

  test('Verify that when zooming in/zooming out by buttons, the zoom is relative to the top left corner of the most top and left monomer in the sequence(Snake mode)', async () => {
    /*
     *  Test case: https://github.com/epam/ketcher/issues/5590
     *  Description: Verify that when zooming in/zooming out by buttons, the zoom is relative to the top left
     *               corner of the most top and left monomer in the sequence (in Snake mode)
     *  Case:
     *        1. Load canvas with monomer chains
     *        2. Switch to Snake mode
     *        2. Take screenshot to witness initial state
     *        3. Zoom In using button 5 times
     *        4. Take screenshot to witness the result
     *        5. Reset Zoom to initial
     *        6. Zoom out using button 5 times
     *        7. Take screenshot to witness the result
     */
    await selectClearCanvasTool(page);
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{G.F.E.D.C.A}|PEPTIDE2{M.L.K.I.H}|PEPTIDE3{Q.P.O.N}|PEPTIDE4{T.S.R}|PEPTIDE5{V.U}|PEPTIDE6{W}$$$$V2.0',
    );
    await takeEditorScreenshot(page);

    const numberOfZooms = 5;
    await selectZoomInTool(page, numberOfZooms);
    await takeEditorScreenshot(page);

    await selectZoomReset(page);
    await selectZoomOutTool(page, numberOfZooms);
    await takeEditorScreenshot(page);

    // await page.getByTestId('zoom-selector').click();
    // await selectFlexLayoutModeTool(page);
  });

  test('Verify that when zooming in/zooming out by buttons, the zoom is relative to the top left corner of the most top and left monomer in the sequence(Sequence m)', async () => {
    /*
     *  Test case: https://github.com/epam/ketcher/issues/5590
     *  Description: Verify that when zooming in/zooming out by buttons, the zoom is relative to the top left
     *               corner of the most top and left monomer in the sequence (in Sequence mode)
     *  Case:
     *        1. Load canvas with monomer chains
     *        2. Switch to Sequence mode
     *        2. Take screenshot to witness initial state
     *        3. Zoom In using button 5 times
     *        4. Take screenshot to witness the result
     *        5. Reset Zoom to initial
     *        6. Zoom out using button 5 times
     *        7. Take screenshot to witness the result
     */
    await selectClearCanvasTool(page);
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{G.F.E.D.C.A}|PEPTIDE2{M.L.K.I.H}|PEPTIDE3{Q.P.O.N}|PEPTIDE4{T.S.R}|PEPTIDE5{V.U}|PEPTIDE6{W}$$$$V2.0',
    );
    await takeEditorScreenshot(page);

    const numberOfZooms = 5;
    await selectZoomInTool(page, numberOfZooms);
    await takeEditorScreenshot(page);

    await selectZoomReset(page);
    await selectZoomOutTool(page, numberOfZooms);
    await takeEditorScreenshot(page);

    await page.keyboard.press('Escape');
    await selectFlexLayoutModeTool(page);
  });

  test('Ensure that the zoom behavior works correctly with large sequences where the top left monomer is off-screen before zooming', async () => {
    /*
     *  Test case: https://github.com/epam/ketcher/issues/5590
     *  Description: Ensure that the zoom behavior works correctly with large sequences where
     *               the top left monomer is off-screen before zooming (in Flex mode)
     *  Case:
     *        1. Load canvas with very long monomer chain
     *        2. Take screenshot to witness initial state
     *        3. Zoom In using button 5 times
     *        4. Take screenshot to witness the result
     *        5. Reset Zoom to initial
     *        6. Zoom Out using button 5 times
     *        7. Take screenshot to witness the result
     */
    await selectClearCanvasTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{G.F.E.D.C.A.M.L.K.I.H.Q.P.O.N.T.S.R.V.U.W.G.F.E.D.C.A.M.L.K.I.H.Q.P.O.N.T.S.R.V.U.W}$$$$V2.0',
    );
    await takeEditorScreenshot(page);

    const numberOfZooms = 5;
    await selectZoomInTool(page, numberOfZooms);
    await takeEditorScreenshot(page);

    await selectZoomReset(page);
    await selectZoomOutTool(page, numberOfZooms);
    await takeEditorScreenshot(page);

    await page.keyboard.press('Escape');
    await selectFlexLayoutModeTool(page);
  });
});

test('Test the zoom-in/zoom-out function using hotkeys (Ctrl+ for zoom in and Ctrl- for zoom out ) and ensure that the zoom focus is correct (Flex mode)', async () => {
  /*
   *  Test case: https://github.com/epam/ketcher/issues/5590
   *  Description: Test the zoom-in/zoom-out function using hotkeys (Ctrl+ for zoom in and Ctrl- for zoom out )
   *               and ensure that the zoom focus is correct (in Flex mode)
   *  Case:
   *        1. Load canvas with monomer chains
   *        2. Take screenshot to witness initial state
   *        3. Zoom In using keyboard shortcut "Ctrl+=" 5 times
   *        4. Take screenshot to witness the result
   *        5. Reset Zoom to initial using keyboard shortcut "Ctrl+0"
   *        6. Zoom Out using keyboard shortcut "Ctrl+-" 5 times
   *        7. Take screenshot to witness the result
   */
  await selectClearCanvasTool(page);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{G.F.E.D.C.A}|PEPTIDE2{M.L.K.I.H}|PEPTIDE3{Q.P.O.N}|PEPTIDE4{T.S.R}|PEPTIDE5{V.U}|PEPTIDE6{W}$$$$V2.0',
  );
  await takeEditorScreenshot(page);

  const numberOfZooms = 5;
  for (let i = 0; i < numberOfZooms; i++) {
    await ZoomInByKeyboard(page);
  }
  await takeEditorScreenshot(page);

  await resetZoomLevelToDefault(page);
  for (let i = 0; i < numberOfZooms; i++) {
    await ZoomOutByKeyboard(page);
  }
  await takeEditorScreenshot(page);
});

test('Test the zoom-in/zoom-out function using hotkeys (Ctrl+ for zoom in and Ctrl- for zoom out ) and ensure that the zoom focus is correct (Snake mode)', async () => {
  /*
   *  Test case: https://github.com/epam/ketcher/issues/5590
   *  Description: Test the zoom-in/zoom-out function using hotkeys (Ctrl+ for zoom in and Ctrl- for zoom out )
   *               and ensure that the zoom focus is correct (in Snake mode)
   *  Case:
   *        1. Load canvas with monomer chains
   *        2. Switch to Snake mode
   *        3. Take screenshot to witness initial state
   *        4. Zoom In using keyboard shortcut "Ctrl+=" 5 times
   *        5. Take screenshot to witness the result
   *        6. Reset Zoom to initial using keyboard shortcut "Ctrl+0"
   *        7. Zoom Out using keyboard shortcut "Ctrl+-" 5 times
   *        8. Take screenshot to witness the result
   */
  await selectClearCanvasTool(page);
  await selectSnakeLayoutModeTool(page);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{G.F.E.D.C.A}|PEPTIDE2{M.L.K.I.H}|PEPTIDE3{Q.P.O.N}|PEPTIDE4{T.S.R}|PEPTIDE5{V.U}|PEPTIDE6{W}$$$$V2.0',
  );
  await takeEditorScreenshot(page);

  const numberOfZooms = 5;
  for (let i = 0; i < numberOfZooms; i++) {
    await ZoomInByKeyboard(page);
  }
  await takeEditorScreenshot(page);

  await resetZoomLevelToDefault(page);
  for (let i = 0; i < numberOfZooms; i++) {
    await ZoomOutByKeyboard(page);
  }
  await takeEditorScreenshot(page);
  await selectFlexLayoutModeTool(page);
});

test('Test the zoom-in/zoom-out function using hotkeys (Ctrl+ for zoom in and Ctrl- for zoom out ) and ensure that the zoom focus is correct (Sequence mode)', async () => {
  /*
   *  Test case: https://github.com/epam/ketcher/issues/5590
   *  Description: Test the zoom-in/zoom-out function using hotkeys (Ctrl+ for zoom in and Ctrl- for zoom out )
   *               and ensure that the zoom focus is correct (in Sequence mode)
   *  Case:
   *        1. Load canvas with monomer chains
   *        2. Switch to Sequence mode
   *        3. Take screenshot to witness initial state
   *        4. Zoom In using keyboard shortcut "Ctrl+=" 5 times
   *        5. Take screenshot to witness the result
   *        6. Reset Zoom to initial using keyboard shortcut "Ctrl+0"
   *        7. Zoom Out using keyboard shortcut "Ctrl+-" 5 times
   *        8. Take screenshot to witness the result
   */
  await selectClearCanvasTool(page);
  await selectSequenceLayoutModeTool(page);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{G.F.E.D.C.A}|PEPTIDE2{M.L.K.I.H}|PEPTIDE3{Q.P.O.N}|PEPTIDE4{T.S.R}|PEPTIDE5{V.U}|PEPTIDE6{W}$$$$V2.0',
  );
  await takeEditorScreenshot(page);

  const numberOfZooms = 5;
  for (let i = 0; i < numberOfZooms; i++) {
    await ZoomInByKeyboard(page);
  }
  await takeEditorScreenshot(page);

  await resetZoomLevelToDefault(page);
  for (let i = 0; i < numberOfZooms; i++) {
    await ZoomOutByKeyboard(page);
  }
  await takeEditorScreenshot(page);
  await selectFlexLayoutModeTool(page);
});
