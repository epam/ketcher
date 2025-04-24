import { Page, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  FILE_TEST_DATA,
  waitForPageInit,
  moveMouseAway,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';
import { selectSaveTool } from '@tests/pages/common/TopLeftToolbar';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { clickOnFileFormatDropdown } from '@utils/formats';

async function saveAsMdlRxnV3000(page: Page) {
  await selectSaveTool(page);
  await clickOnFileFormatDropdown(page);
  await page.getByRole('option', { name: 'MDL Rxnfile V3000' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

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
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/mdl-rxnfile-v2000-expected.rxn',
      FileType.RXN,
      'v2000',
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
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    await verifyFileExport(
      page,
      'Rxn-V3000/mdl-rxnfile-v3000-expected.rxn',
      FileType.RXN,
      'v3000',
    );
  });

  test('File saves in "MDL rxnfile V2000" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4675
    Description: File saved in format (e.g. "ketcher.rxn")
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/mdl-rxnfile-v2000-expected.rxn',
      FileType.RXN,
      'v2000',
    );

    await selectSaveTool(page);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  });

  test('File saves in "MDL rxnfile V3000" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4676
    Description: File saved in format (e.g. "ketcher.rxn")
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    await verifyFileExport(
      page,
      'Rxn-V3000/benzene-arrow-benzene-reagent-nh3-expected.rxn',
      FileType.RXN,
      'v3000',
    );

    await saveAsMdlRxnV3000(page);
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
      'Rxn-V2000/mdl-rxnfile-v2000-expected.rxn',
      page,
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
      'Rxn-V3000/mdl-rxnfile-v3000-expected.rxn',
      page,
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
    await pasteFromClipboardAndAddToCanvas(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV2000,
    );
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
    await pasteFromClipboardAndAddToCanvas(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV3000,
    );
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
        'Rxn-V3000/reagents-below-and-above.rxn',
        page,
      );
      await clickInTheMiddleOfTheScreen(page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );
});
