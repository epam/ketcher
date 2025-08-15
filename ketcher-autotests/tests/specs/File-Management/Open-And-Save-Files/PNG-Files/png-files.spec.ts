import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvas,
} from '@utils';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { setACSSettings } from '@tests/pages/molecules/canvas/SettingsDialog';

test.describe('Saving in .png files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });
  const testData1 = [
    {
      filename: 'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      description: 'unsplit-nucleotides-connected-with-nucleotides',
    },
    {
      filename: 'KET/unsplit-nucleotides-connected-with-chems.ket',
      description: 'connection nucleotides with chems',
    },
    {
      filename: 'KET/unsplit-nucleotides-connected-with-bases.ket',
      description: 'unsplit-nucleotides-connected-with-bases',
    },
    {
      filename: 'KET/unsplit-nucleotides-connected-with-sugars.ket',
      description: 'unsplit-nucleotides-connected-with-sugars',
    },
    {
      filename: 'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      description: 'unsplit-nucleotides-connected-with-phosphates',
    },
    {
      filename: 'KET/unsplit-nucleotides-connected-with-peptides.ket',
      description: 'unsplit-nucleotides-connected-with-peptides',
    },
  ];

  for (const { filename, description } of testData1) {
    test(`Export to PNG: Verify it is possible to export ${description} to PNG`, async ({
      page,
    }) => {
      await openFileAndAddToCanvas(page, filename);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(
        MoleculesFileFormatType.PNGImage,
      );
      await takeEditorScreenshot(page);
    });
  }

  test(`Verify it is possible to export the simple schema with retrosynthetic arrow to PNG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to PNG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });

  test(`Verify it is possible to export the schema with retrosynthetic, angel arrows and plus to PNG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to PNG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });

  test(`Verify it is possible to export the schema with vertical retrosynthetic arrow to PNG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to PNG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-vertical-retrosynthetic-arrow.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });

  test(`Verify it is possible to export the schema with two retrosynthetic arrows to PNG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to PNG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-two-retrosynthetic-arrows.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });

  test(`Verify it is possible to export the schema with diagonaly retrosynthetic arrow to PNG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to PNG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });

  test(`Verify it is possible to export the schema reverse retrosynthetic arrow and pluses to PNG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to PNG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });

  test('The ACS setting is applied, click on layout and it should be save to PNG', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option ACS style and check saving to different format
  Need to update screenshots after implementing https://github.com/epam/ketcher/issues/5650 and 
  https://github.com/epam/Indigo/issues/2458
  https://github.com/epam/Indigo/issues/2457
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setACSSettings(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
  });
});
