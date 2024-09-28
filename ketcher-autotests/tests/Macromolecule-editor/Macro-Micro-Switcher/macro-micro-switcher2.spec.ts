/* eslint-disable no-magic-numbers */
/*
Tests below moved here from macro-micro-switcher since they are designed to be executed in isolated environment 
and can't be executed in "clear canvas way"
*/
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test, expect } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  waitForPageInit,
  selectSingleBondTool,
  selectSnakeLayoutModeTool,
  getKet,
  saveToFile,
  receiveFileComparisonData,
  getMolfile,
  selectLeftPanelButton,
  LeftPanelButton,
  openFileAndAddToCanvasAsNewProject,
  selectDropdownTool,
  clickInTheMiddleOfTheScreen,
  selectClearCanvasTool,
} from '@utils';
import { Peptides } from '@utils/selectors/macromoleculeEditor';

async function addToFavoritesMonomers(page: Page) {
  await page.getByTestId(Peptides.BetaAlanine).getByText('★').click();
  await page
    .getByTestId('Phe4Me___p-Methylphenylalanine')
    .getByText('★')
    .click();
  await page.getByTestId('meM___N-Methyl-Methionine').getByText('★').click();
  await page.getByTestId('RNA-TAB').click();
  await page.getByTestId('summary-Sugars').click();
  await page.getByTestId('25R___2,5-Ribose').getByText('★').click();
  await page.getByTestId('summary-Bases').click();
  await page.getByTestId('baA___N-benzyl-adenine').getByText('★').click();
  await page.getByTestId('summary-Phosphates').click();
  await page.getByTestId('bP___Boranophosphate').getByText('★').click();
  await page.getByTestId('CHEM-TAB').click();
  await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').getByText('★').click();
}

test.describe('Macro-Micro-Switcher2', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Add to Favorites section Peptides, Sugars, Bases, Phosphates and CHEMs then Hide Library and switch to Micro mode and back', async ({
    page,
  }) => {
    /* 
      Test case: Macro-Micro-Switcher
      Description: Added to Favorites section Peptides, Sugars, Bases, Phosphates and CHEMs 
      when Hide Library and switching from Macro mode to Micro mode and back to Macro is saved
      */
    await addToFavoritesMonomers(page);
    await page.getByText('Hide').click();
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
    await page.getByTestId('FAVORITES-TAB').click();
    await takeMonomerLibraryScreenshot(page);
  });

  const cases = [
    {
      fileName: 'Molfiles-V3000/dna-mod-base-sugar-phosphate-example.mol',
      description: 'DNA with modified monomer',
    },
    {
      fileName: 'Molfiles-V3000/rna-mod-phosphate-mod-base-example.mol',
      description: 'RNA with modified monomer',
    },
  ];

  for (const testInfo of cases) {
    test(`Check that switching between Macro and Micro mode not crash application when opened ${testInfo.description} with modyfied monomer`, async ({
      page,
    }) => {
      /* 
        Test case: Macro-Micro-Switcher/#3747
        Description: Switching between Macro and Micro mode not crash application when opened DNA/RNA with modyfied monomer
        */
      await openFileAndAddToCanvasMacro(testInfo.fileName, page);
      await turnOnMicromoleculesEditor(page);
      await takeEditorScreenshot(page);
      await turnOnMacromoleculesEditor(page);
      await selectSnakeLayoutModeTool(page);
      await takeEditorScreenshot(page);
    });
  }
});

test.describe('Macro-Micro-Switcher2', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check that AP label selection works but not saves to KET', async ({
    page,
  }) => {
    /*
      Test case: Macro-Micro-Switcher/#4530
      Description: AP label selection works but not saves to KET.
      */
    await openFileAndAddToCanvas(
      'KET/structure-with-two-attachment-points.ket',
      page,
    );
    await page.keyboard.down('Shift');
    await page.getByText('R1').locator('..').click();
    await page.getByText('R2').locator('..').click();
    await page.keyboard.up('Shift');
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/structure-with-two-attachment-points-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/structure-with-two-attachment-points-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/structure-with-two-attachment-points-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Check that attachment points and leaving groups are correctly represented in KET format', async ({
    page,
  }) => {
    /*
      Test case: #4530
      Description: Attachment points and leaving groups are correctly represented in KET format.
      */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/one-attachment-point-added-in-micro-mode-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/one-attachment-point-added-in-micro-mode-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/one-attachment-point-added-in-micro-mode-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that we can save bond between micro and macro structures to Mol V3000 format', async ({
    page,
  }) => {
    /*
      Test case: #4530
      Description: We can save bond between micro and macro structures to Mol V3000 format.
      */
    await openFileAndAddToCanvas(
      'KET/chem-connected-to-micro-structure.ket',
      page,
    );
    const expectedFile = await getMolfile(page, 'v3000');
    await saveToFile(
      'Molfiles-V3000/chem-connected-to-micro-structure-expected.mol',
      expectedFile,
    );

    const METADATA_STRINGS_INDEXES = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/chem-connected-to-micro-structure-expected.mol',
        metaDataIndexes: METADATA_STRINGS_INDEXES,
        fileFormat: 'v3000',
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Check that attachment points and leaving groups are correctly represented in Mol V3000 format', async ({
    page,
  }) => {
    /*
      Test case: #4530
      Description: Attachment points and leaving groups are correctly represented in Mol V3000 format.
      */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    const expectedFile = await getMolfile(page, 'v3000');
    await saveToFile(
      'Molfiles-V3000/one-attachment-point-added-in-micro-mode-expected.mol',
      expectedFile,
    );

    const METADATA_STRINGS_INDEXES = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/one-attachment-point-added-in-micro-mode-expected.mol',
        metaDataIndexes: METADATA_STRINGS_INDEXES,
        fileFormat: 'v3000',
      });

    expect(molFile).toEqual(molFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/one-attachment-point-added-in-micro-mode-expected.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Connection one molecule to another one by drugging one over another - result indicate existence of AP label and it remain back after delete connection', async ({
    page,
  }) => {
    /*
        Test case: Macro-Micro-Switcher/#4530
        Description: We can connect molecule to attachment point and when delete bond attachment point remains.
      */
    await openFileAndAddToCanvas(
      'KET/one-attachment-point-with-oxygen.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByTestId('canvas').getByText('O').click();
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await selectSingleBondTool(page);
    await page.getByText('F1').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  test('Validate that it is possible to save micro-macro connection to mol v3000 file', async ({
    page,
  }) => {
    /*
      Test case: #4532
      Description: It is possible to save micro-macro connection to mol v3000 file.
      */
    await openFileAndAddToCanvas('KET/micro-macro-structure.ket', page);
    const expectedFile = await getMolfile(page, 'v3000');
    await saveToFile(
      'Molfiles-V3000/micro-macro-structure-expected.mol',
      expectedFile,
    );

    const METADATA_STRINGS_INDEXES = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/micro-macro-structure-expected.mol',
        metaDataIndexes: METADATA_STRINGS_INDEXES,
        fileFormat: 'v3000',
      });

    expect(molFile).toEqual(molFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/micro-macro-structure-expected.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open from KET 3 different Multi-Tailed Arrows, add default Multi-Tailed Arrow by Tool, switch to Macro', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Open from KET 3 different Multi-Tailed Arrows, add default Multi-Tailed Arrow by Tool, switch to Macro,
     * verify that Arrows are not presented on the Canvas after switching to Macro mode, Clear Canvas, switch back to Micro mode,
     * verify that arrows are presented after returning to Micro mode.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows.ket',
      page,
    );
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await selectClearCanvasTool(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Switch to Macro mode, open from KET 3 different Multi-Tailed Arrows, verify that arrows are not presented in Macro mode,  Clear Canvas, switch back to Micro mode', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Switch to Macro mode, open from KET 3 different Multi-Tailed Arrows, verify that arrows aren't presented in Macro mode,
     * Clear Canvas, switch back to Micro mode, verify that arrows are presented in Micro mode.
     */
    await turnOnMacromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectClearCanvasTool(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });
});
