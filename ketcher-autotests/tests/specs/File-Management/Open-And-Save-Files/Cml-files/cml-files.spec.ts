import { Page, test } from '@playwright/test';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/indigo2';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  setReactionMarginSizeOptionUnit,
  setBondLengthOptionUnit,
  setBondLengthValue,
  pressButton,
  setReactionMarginSizeValue,
  openSettings,
  setHashSpacingOptionUnit,
  setHashSpacingValue,
  openBondsSettingsSection,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

async function openFileAddToCanvasTakeScreenshot(page: Page, fileName: string) {
  await openFileAndAddToCanvas(fileName, page);
  await takeEditorScreenshot(page);
}

test.describe('CML files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open and Save files - CML - CML for empty canvas', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1944
     * Description: Save a clear canvas in CML format with preset parameters:
     * The input field contains <?xml version="1.0" ?> <cml> <molecule title="" /> </cml>.
     */

    await verifyFileExport(page, 'CML/cml-12492-compare.cml', FileType.CML);
  });

  test('Open and Save file - CML - CML for structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1945
     * Description: Saved cml file with structure is compering with paste cml structure golden file
     */
    await openFileAddToCanvasTakeScreenshot(page, 'CML/cml-molecule.cml');
    // check that structure opened from file is displayed correctly

    await verifyFileExport(page, 'CML/cml-molecule-expected.cml', FileType.CML);
  });

  test('Open and Save file - CML - CML for some structures', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1946
     * Description: Saved cml file with structure is compering with paste cml 3 structures
     */
    await openFileAddToCanvasTakeScreenshot(page, 'CML/cml-1946.cml');
    // check that structure opened from file is displayed correctly

    await verifyFileExport(page, 'CML/cml-1946-expected.cml', FileType.CML);
  });

  test('Open and Save file - CML - CML for reaction', async ({ page }) => {
    /**
   * Test case: EPMLSOPKET-1947
    Description: Saved cml file with structure is compering with paste reaction from rxn file
  */
    await openFileAddToCanvasTakeScreenshot(
      page,
      'Rxn-V2000/cml-1947-reaction.rxn',
    );
    // check that structure opened from file is displayed correctly

    await verifyFileExport(
      page,
      'CML/cml-1947-reaction-expected.cml',
      FileType.CML,
    );
  });

  test('Open and Save file - CML - CML for R-group and other features', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1948
     * Description: Saved cml file with structure is compering with paste R-group from a mol file
     */

    await openFileAddToCanvasTakeScreenshot(
      page,
      'Molfiles-V2000/cml-1948-R-group.mol',
    );
    // check that structure opened from file is displayed correctly

    await verifyFileExport(
      page,
      'CML/cml-1948-r-group-expected.cml',
      FileType.CML,
    );
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to CML file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
      page,
    );

    await verifyFileExport(
      page,
      'CML/unsplit-nucleotides-connected-with-peptides.cml',
      FileType.CML,
    );

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-peptides.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with nucleotides could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with nucleotides could be saved to CML file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );

    await verifyFileExport(
      page,
      'CML/unsplit-nucleotides-connected-with-nucleotides.cml',
      FileType.CML,
    );

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-nucleotides.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to CML file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-chems.ket',
      page,
    );

    await verifyFileExport(
      page,
      'CML/unsplit-nucleotides-connected-with-chems.cml',
      FileType.CML,
    );

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-chems.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to CML file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-bases.ket',
      page,
    );

    await verifyFileExport(
      page,
      'CML/unsplit-nucleotides-connected-with-bases.cml',
      FileType.CML,
    );

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-bases.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to CML file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
      page,
    );

    await verifyFileExport(
      page,
      'CML/unsplit-nucleotides-connected-with-sugars.cml',
      FileType.CML,
    );

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-sugars.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to CML file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      page,
    );

    await verifyFileExport(
      page,
      'CML/unsplit-nucleotides-connected-with-phosphates.cml',
      FileType.CML,
    );

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-phosphates.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test(
    'Validate that the simple schema with retrosynthetic arrow could be saved to CML file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to CML file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2206
    After fix we need update file and screenshot.
    */

      await openFileAndAddToCanvas(
        'KET/simple-schema-with-retrosynthetic-arrow.ket',
        page,
      );

      await verifyFileExport(
        page,
        'CML/simple-schema-with-retrosynthetic-arrow.cml',
        FileType.CML,
      );

      await openFileAndAddToCanvasAsNewProject(
        'CML/simple-schema-with-retrosynthetic-arrow.cml',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Validate that the simple schema with retrosynthetic, angel arrows and plus could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to CML file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2206
    After fix we need update file and screenshot.
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
      page,
    );

    await verifyFileExport(
      page,
      'CML/schema-with-retrosynthetic-angel-arrows-and-plus.cml',
      FileType.CML,
    );

    await openFileAndAddToCanvasAsNewProject(
      'CML/schema-with-retrosynthetic-angel-arrows-and-plus.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test(
    'Validate that the simple schema with two retrosynthetic arrows could be saved to CML file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to CML file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2206
    After fix we need update file and screenshot.
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-two-retrosynthetic-arrows.ket',
        page,
      );

      await verifyFileExport(
        page,
        'CML/schema-with-two-retrosynthetic-arrows.cml',
        FileType.CML,
      );

      await openFileAndAddToCanvasAsNewProject(
        'CML/schema-with-two-retrosynthetic-arrows.cml',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Validate that the simple schema with reverse retrosynthetic arrow and pluses could be saved to CML file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to CML file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2206
    After fix we need update file and screenshot.
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
        page,
      );

      await verifyFileExport(
        page,
        'CML/schema-with-reverse-retrosynthetic-arrow-and-pluses.cml',
        FileType.CML,
      );

      await openFileAndAddToCanvasAsNewProject(
        'CML/schema-with-reverse-retrosynthetic-arrow-and-pluses.cml',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Validate that the simple schema with vertical retrosynthetic arrow could be saved to CML file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to CML file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2206
    After fix we need update file and screenshot.
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-vertical-retrosynthetic-arrow.ket',
        page,
      );

      await verifyFileExport(
        page,
        'CML/schema-with-vertical-retrosynthetic-arrow.cml',
        FileType.CML,
      );

      await openFileAndAddToCanvasAsNewProject(
        'CML/schema-with-vertical-retrosynthetic-arrow.cml',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Validate that the simple schema with diagonal retrosynthetic arrow could be saved to CML file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to CML file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2206
    After fix we need update file and screenshot.
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
        page,
      );

      await verifyFileExport(
        page,
        'CML/schema-with-diagonal-retrosynthetic-arrow.cml',
        FileType.CML,
      );

      await openFileAndAddToCanvasAsNewProject(
        'CML/schema-with-diagonal-retrosynthetic-arrow.cml',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('The Bond length setting with px option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Bond length setting is applied, click on layout and it should be save to CML specification
    After implementing https://github.com/epam/ketcher/issues/1933 need to update screenshot
    */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '67.8');
    await pressButton(page, 'Apply');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'CML/layout-with-catalyst-px-bond-lengh.cml',
      FileType.CML,
    );

    await openFileAndAddToCanvasAsNewProject(
      'CML/layout-with-catalyst-px-bond-lengh.cml',
      page,
    );

    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with pt option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Hash spacing setting is applied, click on layout and it should be save to CML specification
    */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setHashSpacingOptionUnit(page, 'pt-option');
    await setHashSpacingValue(page, '54.8');
    await pressButton(page, 'Apply');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CML/layout-with-catalyst-pt-hash-spacing-expected.cml',
      FileType.CML,
    );
    await openFileAndAddToCanvasAsNewProject(
      'CML/layout-with-catalyst-pt-hash-spacing-expected.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Reaction component margin size setting with cm option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Reaction component margin size setting is applied, click on layout and it should be save to CML specification
    After implementing https://github.com/epam/ketcher/issues/1933 need to update screenshot
    */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '1.8');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'CML/layout-with-dif-elements-cm-margin-size.cml',
      FileType.CML,
    );

    await openFileAndAddToCanvasAsNewProject(
      'CML/layout-with-dif-elements-cm-margin-size.cml',
      page,
    );

    await takeEditorScreenshot(page);
  });

  test('The ACS Style setting is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option AVS style and check saving to different format
  After implementing https://github.com/epam/ketcher/issues/1933 need to update screenshot
  */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await openSettings(page);
    await pressButton(page, 'Set ACS Settings');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CML/layout-with-dif-elements-acs-style.cml',
      FileType.CML,
    );

    await openFileAndAddToCanvasAsNewProject(
      'CML/layout-with-dif-elements-acs-style.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
