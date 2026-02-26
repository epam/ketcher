import { test } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  moveMouseAway,
  pasteFromClipboardAndAddToCanvas,
  RxnFileFormat,
  readFileContent,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

test.describe('Reagents RXN format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Detection molecule as reagent and write reagent information in "MDL rxnfile V2000" format', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4671
    Description: Files are compared for reagent presence
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/mdl-rxnfile-v2000-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
  });

  test('Detection molecule as reagent and write reagent information in "MDL rxnfile V3000" format', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4672
    Description: Files are compared for reagent presence
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
    );
    await verifyFileExport(
      page,
      'Rxn-V3000/mdl-rxnfile-v3000-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
  });

  test('File saves in "MDL rxnfile V2000" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4675
    Description: File saved in format (e.g. "ketcher.rxn")
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/mdl-rxnfile-v2000-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).save();
  });

  test('File saves in "MDL rxnfile V3000" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4676
    Description: File saved in format (e.g. "ketcher.rxn")
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
    );
    await verifyFileExport(
      page,
      'Rxn-V3000/benzene-arrow-benzene-reagent-nh3-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.MDLRxnfileV3000,
    );
    await SaveStructureDialog(page).save();
  });
});

test.describe('Reagents RXN format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.fail('Open from file in "RXN V2000" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4679
      Description: Reagent 'NH3' above the reaction arrow
      We have a bug https://github.com/epam/Indigo/issues/2591
      */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/mdl-rxnfile-v2000-expected.rxn',
    );
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test.fail('Open from file in "RXN V3000" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4680
      Description: Reagent 'NH3' above the reaction arrow
      We have a bug https://github.com/epam/Indigo/issues/2591
      */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V3000/mdl-rxnfile-v3000-expected.rxn',
    );
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "RXN V2000" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4677
      Description: Reagent 'Cl' displays below reaction arrow
      */
    const fileContent = await readFileContent(
      'Rxn-V2000/benzene-arrow-benzene-reagent-hcl.rxn',
    );
    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test.fail('Paste from clipboard in "RXN V3000" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4678
      Description: Reagent 'Cl' displays below reaction arrow
      We have a bug https://github.com/epam/Indigo/issues/2591
      */
    const fileContent = await readFileContent(
      'Rxn-V3000/benzene-arrow-benzene-reagent-hcl.rxn',
    );
    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test.fail(
    'Open from file in "RXN V3000" format with reagents above and below arrow',
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-8912
      Description: Reagent 'NH3' above the reaction arrow and reagent HBr below.
      We have a bug https://github.com/epam/Indigo/issues/2591
      */
      await openFileAndAddToCanvas(
        page,
        'Rxn-V3000/reagents-below-and-above.rxn',
      );
      await clickInTheMiddleOfTheScreen(page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );
});
