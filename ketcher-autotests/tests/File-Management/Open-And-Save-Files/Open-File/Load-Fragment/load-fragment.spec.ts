import { test, expect } from '@playwright/test';
import {
  AtomButton,
  clickInTheMiddleOfTheScreen,
  pressButton,
  takeEditorScreenshot,
  waitForLoad,
  openFileAndAddToCanvas,
  openPasteFromClipboard,
  waitForPageInit,
  selectAtomInToolbar,
  selectLeftPanelButton,
  dragMouseTo,
  LeftPanelButton,
  selectDropdownTool,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  resetCurrentTool,
  receiveFileComparisonData,
  saveToFile,
} from '@utils';
import { getKet } from '@utils/formats';

test.describe('load as fragment (Add to Canvas) srtuctures from files with different formats', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Load Fragment - Load as fragment (Add to Canvas) - mol-files', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET-1854
     */
    await openFileAndAddToCanvas('Molfiles-V2000/glutamine.mol', page);
    await openFileAndAddToCanvas('Molfiles-V2000/cyclopentyl.mol', page);
  });

  test('Load Fragment - Load as fragment (Add to Canvas) - rxn-files', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET-1860
     */
    await openFileAndAddToCanvas('Molfiles-V2000/cyclopentyl.mol', page);
    // Coordinates for rectangle selection
    const startX = 525;
    const startY = 260;
    const endX = 765;
    const endY = 460;

    const xForMouseClick = 555;
    const yForMouseClick = 420;
    const xForMoveElement = 200;
    const yForMoveElement = 180;

    await selectDropdownTool(page, 'select-rectangle', 'select-rectangle');
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();
    await page.mouse.move(xForMouseClick, yForMouseClick);
    await dragMouseTo(xForMoveElement, yForMoveElement, page);

    await openFileAndAddToCanvas('Rxn-V2000/reaction-3.rxn', page);
  });

  test('Load Fragment - Load as fragment (Add to Canvas) - smi-files', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET-1861
     */
    await openFileAndAddToCanvas('Molfiles-V2000/glutamine.mol', page);
    await openFileAndAddToCanvas('SMILES/1840-cyclopentyl.smi', page);
  });

  test('Open file - Input SMILE-string', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-1836
     */
    const smileString = 'C1=CC=CC=C1';
    const secondSmileString = 'C1=CC=CC=C1>>C1=CC=CC=C1';
    const thirdSmileString = 'CCCCCC';
    const incorrectSmileString = 'CCCCC0';

    await openPasteFromClipboard(page, smileString);
    await waitForLoad(page, async () => {
      await pressButton(page, 'Cancel');
    });

    await openPasteFromClipboard(page, smileString);
    await waitForLoad(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
    await takeEditorScreenshot(page);

    await openPasteFromClipboard(page, secondSmileString);
    await waitForLoad(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
    await takeEditorScreenshot(page);

    await openPasteFromClipboard(page, thirdSmileString);
    await waitForLoad(page, async () => {
      await pressButton(page, 'Open as New Project');
    });
    await takeEditorScreenshot(page);

    await openPasteFromClipboard(page, incorrectSmileString);
    await pressButton(page, 'Open as New Project');
    const convertErrorMessage = await page
      .getByTestId('info-modal-body')
      .textContent();
    const expectedErrorMessage =
      'Convert error!\nGiven string could not be loaded as (query or plain) molecule or reaction, see the error messages: ' +
      "'molecule auto loader: SMILES loader: cycle number 0 is not allowed', " +
      "'scanner: BufferScanner::read() error', 'scanner: BufferScanner::read() error', " +
      "'molecule auto loader: SMILES loader: cycle number 0 is not allowed'";
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });

  test('Open file - Open *.ket file', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-2933
     */
    await openFileAndAddToCanvas('Molfiles-V2000/glutamine.mol', page);
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
  });

  test('Open/Import structure as a KET file - create KET file', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET-4702 (creating file)
     * Description: Creating a reaction using elements from vertical tool bars
     * Hydrogen tool is applied and element is moved on the left
     * Reaction Plus tool is applied and element is moved on the left
     * Oxygen tool is applied and element is moved on the left
     * Arrow Open Angle tool is applied
     * Hydrogen tool is applied again and placed on the right
     */
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const shiftForHydrogen = 150;
    const shiftForReactionPlus = 100;
    const shiftForOxygen = 40;
    const shiftForCoordinatesToResetArrowOpenAngleTool = 100;
    const shiftForSecondHydrogen = 120;

    await selectAtomInToolbar(AtomButton.Hydrogen, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(x - shiftForHydrogen, y, page);
    await resetCurrentTool(page);

    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(x - shiftForReactionPlus, y, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(x - shiftForOxygen, y, page);
    await resetCurrentTool(page);

    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await page.mouse.move(x, y + shiftForCoordinatesToResetArrowOpenAngleTool);
    await page.mouse.click;

    await selectAtomInToolbar(AtomButton.Hydrogen, page);
    await page.mouse.click(x + shiftForSecondHydrogen, y, {
      button: 'left',
    });
  });

  test('Open/Import structure as a KET file - open KET file', async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET-4702 (opening file)
     * Test is related to the existing bug: https://github.com/epam/ketcher/issues/3153
     */
    await openFileAndAddToCanvas(
      'KET/hydrogen-plus-oxygen-arrow-hydrogen.ket',
      page,
    );

    const expectedKetFile = await getKet(page);
    await saveToFile('KET/ket-4702-expected.ket', expectedKetFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/ket-4702-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });
});
