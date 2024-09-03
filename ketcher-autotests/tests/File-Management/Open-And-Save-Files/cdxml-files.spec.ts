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
  waitForPageInit,
  bondsDefaultSettings,
  setBondLengthOptionUnit,
  setBondLengthValue,
  pressButton,
  setReactionMarginSizeOptionUnit,
  setReactionMarginSizeValue,
} from '@utils';
import { getCdxml } from '@utils/formats';

test.describe('Tests for API setMolecule/getMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Paste CDXML', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2956
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-2956.cdxml', page);
    // check that structure opened from file is displayed correctly
  });

  test('Open CDXML by Open Structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-3086
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-3086.cdxml', page);
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
    await openFileAndAddToCanvas('CDXML/cdxml-4713.cdxml', page);
  });

  test('Text tool - Save as .cdxml file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4714
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4714.cdxml', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
  });

  test('Simple Objects - Delete file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4715
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4715.cdxml', page);
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
    await openFileAndAddToCanvas('CDXML/cdxml-4716.cdxml', page);

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
    await openFileAndAddToCanvas('CDXML/cdxml-4717.cdxml', page);
    // check that structure opened from file is displayed correctly
  });

  test('Open/save/open cdxml file with structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4718
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4718-structures.cdxml', page);
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

  test('The Bond length setting with px option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to KET specification
  */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-catalyst-px-bond-lengh.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-catalyst-px-bond-lengh.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('The Bond length setting with pt option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to KET specification
  */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-diagonally-arrow-pt-bond-lengh.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-diagonally-arrow-pt-bond-lengh.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('The Bond length setting with cm option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to KET specification
  */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-dif-elements-cm-bond-lengh.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-dif-elements-cm-bond-lengh.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('The Bond length setting with inch option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to KET specification
  */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-long-molecule-inch-bond-lengh.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-long-molecule-inch-bond-lengh.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('The Reaction component margin size setting with px option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to KET specification
  */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await bondsDefaultSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-catalyst-px-margin-size.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-catalyst-px-margin-size.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('The Reaction component margin size setting with pt option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to KET specification
  */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await bondsDefaultSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-diagonally-arrow-pt-margin-size.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-diagonally-arrow-pt-margin-size.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('The Reaction component margin size setting with cm option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to KET specification
  */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await bondsDefaultSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-dif-elements-cm-margin-size.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-dif-elements-cm-margin-size.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('The Reaction component margin size setting with inch option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to KET specification
  */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await bondsDefaultSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-long-molecule-inch-margin-size.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-long-molecule-inch-margin-size.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });
});
