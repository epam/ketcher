import { Page, expect, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  pressButton,
  delay,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  FILE_TEST_DATA,
  DELAY_IN_SECONDS,
  waitForLoad,
} from '@utils';

import NH3TextAboveRequestData from '@tests/test-data/cdxml-nh3-text-above-request-data.json';
import NH3TextAboveTestData from '@tests/test-data/cdxml-nh3-text-above-arrow-result.json';
import NH3MoleculeAboveRequestData from '@tests/test-data/cdxml-nh3-molecule-above-request-data.json';
import NH3MoleculeAboveTestData from '@tests/test-data/cdxml-nh3-molecule-above-result.json';
import HClTextBelowRequestData from '@tests/test-data/cdxml-hcl-text-below-request-data.json';
import HClTextBelowTestData from '@tests/test-data/cdxml-hcl-text-below-result.json';
import HClMoleculeBelowRequestData from '@tests/test-data/cdxml-hcl-molecule-below-request-data.json';
import HClMoleculeBelowTestData from '@tests/test-data/cdxml-hcl-molecule-below-result.json';
import { API_INDIGO_URL } from '@constants';

async function previewCDXML(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
  await page.getByRole('option', { name: 'CDXML' }).click();
  await delay(DELAY_IN_SECONDS.ONE);
}

async function pasteCDXML(page: Page, fileFormat: string) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fileFormat);
  await waitForLoad(page, async () => {
    await pressButton(page, 'Add to Canvas');
  });
}

test.describe('Reagents CDXML format', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Detection molecule as reagent and write reagent information in "CDXML" format in "Preview" tab', async ({
    page,
    request,
  }) => {
    /*
    Test case: EPMLSOPKET-4719
    Description: System detect molecule NH3 above arrow as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas('benzene-arrow-benzene-reagent-nh3.ket', page);
    await delay();

    const cdxmlResult = await request.post(`${API_INDIGO_URL}/convert`, {
      data: NH3MoleculeAboveRequestData,
    });
    const cdxmlFromIndigo = await cdxmlResult.json();

    expect(cdxmlFromIndigo).toEqual(NH3MoleculeAboveTestData);

    await previewCDXML(page);
  });

  test(`Detection molecule as reagent below arrow 
  and write reagent information in "CDXML" format in "Preview" tab`, async ({
    page,
    request,
  }) => {
    /*
    Test case: EPMLSOPKET-4719
    Description: System detect molecule HCl below arrow as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas('benzene-arrow-benzene-reagent-hcl.ket', page);
    await delay(DELAY_IN_SECONDS.THREE);

    const cdxmlResult = await request.post(`${API_INDIGO_URL}/convert`, {
      data: HClMoleculeBelowRequestData,
    });
    const cdxmlFromIndigo = await cdxmlResult.json();

    expect(cdxmlFromIndigo).toEqual(HClMoleculeBelowTestData);

    await previewCDXML(page);
  });

  test(`Detection text above arrow as reagent
  and write reagent information in "CDXML" format in "Preview" tab`, async ({
    page,
    request,
  }) => {
    /*
    Test case: EPMLSOPKET-4720
    Description: System detect text NH3 as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas('reagent-nh3-text-above-arrow.ket', page);
    await delay(DELAY_IN_SECONDS.THREE);

    const cdxmlResult = await request.post(`${API_INDIGO_URL}/convert`, {
      data: NH3TextAboveRequestData,
    });
    const cdxmlFromIndigo = await cdxmlResult.json();

    expect(cdxmlFromIndigo).toEqual(NH3TextAboveTestData);

    await previewCDXML(page);
  });

  test(`Detection text as reagent below arrow 
  and write reagent information in "CDXML" format in "Preview" tab`, async ({
    page,
    request,
  }) => {
    /*
    Test case: EPMLSOPKET-4720
    Description: System detect text HCl below arrow as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas('reagent-hcl-text-below-arrow.ket', page);
    await delay(DELAY_IN_SECONDS.THREE);

    const cdxmlResult = await request.post(`${API_INDIGO_URL}/convert`, {
      data: HClTextBelowRequestData,
    });
    const cdxmlFromIndigo = await cdxmlResult.json();

    expect(cdxmlFromIndigo).toEqual(HClTextBelowTestData);

    await previewCDXML(page);
  });

  test('File saves in "CDXML" format', async ({ page, request }) => {
    /*
    Test case: EPMLSOPKET-4721
    Description: File saved in format (e.g. "ketcher.cdxml")
    */
    await openFileAndAddToCanvas('benzene-arrow-benzene-reagent-nh3.ket', page);
    await delay(DELAY_IN_SECONDS.THREE);

    const cdxmlResult = await request.post(`${API_INDIGO_URL}/convert`, {
      data: NH3MoleculeAboveRequestData,
    });
    const cdxmlFromIndigo = await cdxmlResult.json();

    expect(cdxmlFromIndigo).toEqual(NH3MoleculeAboveTestData);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
    await page.getByRole('option', { name: 'CDXML' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  });

  test('Paste from clipboard in "CDXML" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4722
      Description: Reagent 'NH3' displays above reaction arrow
      */
    await pasteCDXML(page, FILE_TEST_DATA.benzeneArrowBenzeneReagentNh3);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Open File CDXML with reagent NH3 above arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent NH3 on top of the arrow
    */
    await openFileAndAddToCanvas('benzene-arrow-benzene-reagent-nh3.ket', page);
  });

  test('Open File CDXML with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent HCl below the arrow
    */
    await openFileAndAddToCanvas('benzene-arrow-benzene-reagent-hcl.ket', page);
  });

  test('Open File CDXML with molecules above and below one arrow', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-5255
      Description: The structure opens as it was saved with all structural elements: 
      plus and two reaction arrows NH3 molecule above first arrow and HCl below second arrow
    */
    await openFileAndAddToCanvas('molecules-above-and-below-arrow.cdxml', page);
  });

  test('Open File CDXML with multistep reactions', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-5256
      Description: The structure opens as it was saved with all structural elements: 
      plus and two reaction arrows NH3 molecule above first arrow and HCl below second arrow
    */
    await openFileAndAddToCanvas('cdxml-multistep.cdxml', page);
  });
});
