import { test, expect } from '@playwright/test';
import {
  AtomButton,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  TopPanelButton,
  selectTopPanelButton,
  selectAtomInToolbar,
  selectLeftPanelButton,
  LeftPanelButton,
  receiveFileComparisonData,
  saveToFile,
} from '@utils';
import { getCdxml } from '@utils/formats';

test.describe('Tests for API setMolecule/getMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Paste CDXML', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2956
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('cdxml-2956.cdxml', page);
    // check that structure opened from file is displayed correctly
  });

  test('Open CDXML by Open Structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-3086
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('cdxml-3086.cdxml', page);
    // check that structure opened from file is displayed correctly
  });

  test('Open/Import structure while opening a CDXML file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4712
     * Description: Open/Import structure while openning a CDXML file
     */
    await selectAtomInToolbar(AtomButton.Hydrogen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Hydrogen, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Open structure in another editor', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4713
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('cdxml-4713.cdxml', page);
  });

  test('Text tool - Save as .cdxml file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4714
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('cdxml-4714.cdxml', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
  });

  test('Simple Objects - Save as .cdxml file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4715
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('cdxml-4715.cdxml', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
  });

  test('Clear Canvas - Structure is opened from .cdxml file', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-4716
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('cdxml-4716.cdxml', page);

    await selectTopPanelButton(TopPanelButton.Clear, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await page.keyboard.press('Control+Delete');
  });

  test('Functional Groups - Open from .cdxml file with contracted and expanded function', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-4717
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('cdxml-4717.cdxml', page);
    // check that structure opened from file is displayed correctly
  });

  test('Open/save/open cdxml file with structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4718
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('cdxml-4718-structures.cdxml', page);
    // check that structure opened from file is displayed correctly
  });

  test('Save/Open file - Save *.cdxml file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-6969
     * Description: Open/Import structure CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-6969.cdxml', page);
    const expectedFile = await getCdxml(page);
    await saveToFile('CDXML/cdxml-6969-expected.cdxml', expectedFile);

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CDXML/cdxml-6969-expected.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });
});
