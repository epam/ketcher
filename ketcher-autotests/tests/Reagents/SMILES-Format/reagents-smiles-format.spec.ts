import { Page, expect, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  readFileContents,
  pasteFromClipboardAndAddToCanvas,
  waitForIndigoToLoad,
} from '@utils';
import {
  getExtendedSmiles,
  getSmiles,
  setMolecule,
  enableDearomatizeOnLoad,
} from '@utils/formats';

async function getPreviewForSmiles(
  page: Page,
  formatName: string,
  smileType: string,
) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: formatName }).click();
  await page.getByRole('option', { name: smileType }).click();
}

async function saveDaylightSmiles(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
  await page.getByRole('option', { name: 'Daylight SMILES' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

async function saveExtendedSmiles(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
  await page.getByRole('option', { name: 'Extended SMILES' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

test.describe('Reagents SMILES format', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await waitForIndigoToLoad(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test(`Detection molecule as reagent 
  and write reagent information in "Daylight SMILES" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4661
    Description: System detect molecule as reagent and write reagent in "Daylight SMILES' 
    format in "Preview" tab (e.g. C1C=CC=CC=1>N>C1C=CC=CC=1 
    where specifying reactant, agent and product molecule(s) separated by the "greater-than" symbol ('>').
    */
    await openFileAndAddToCanvas(
      'Ket/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    const smiFileExpected = await readFileContents(
      'tests/test-data/daylight-smiles-expected.smi',
    );
    const smiFile = await getSmiles(page);
    expect(smiFile).toEqual(smiFileExpected);

    await getPreviewForSmiles(page, 'MDL Rxnfile V2000', 'Daylight SMILES');
  });

  test(`Detection molecule as reagent below arrow
  and write reagent information in "Daylight SMILES" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4661
    Description: System detect molecule as reagent and write reagent in "Daylight SMILES' 
    format in "Preview" tab (e.g. C1(C)C(O)=CC(S)=C(N)C=1>Cl>C1(Br)C(C)=CC(I)=C(O)C=1 
    where specifying reactant, agent and product molecule(s) separated by the "greater-than" symbol ('>').
    */
    await openFileAndAddToCanvas('benzene-arrow-benzene-reagent-hcl.ket', page);

    const smiFileExpected = await readFileContents(
      'tests/test-data/daylight-smiles-below-expected.smi',
    );
    const smiFile = await getSmiles(page);
    expect(smiFile).toEqual(smiFileExpected);

    await getPreviewForSmiles(page, 'MDL Rxnfile V2000', 'Daylight SMILES');
  });

  test(`Detection molecule as reagent
  and write reagent information in "Extended SMILES" format in "Preview" tab @check`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4662
    Description: System detect molecule as reagent and write reagent in "Extended SMILES' 
    format in "Preview" tab (e.g. C1C=CC=CC=1>N>C1C=CC=CC=1 
    where specifying reactant, agent and product molecule(s) separated by the "greater-than" symbol ('>').
    */
    await openFileAndAddToCanvas(
      'Ket/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    await getPreviewForSmiles(page, 'MDL Rxnfile V2000', 'Extended SMILES');
  });

  test(`Detection molecule as reagent below arrow
  and write reagent information in "Extended SMILES" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4662
    Description: System detect molecule as reagent and write reagent in "Extended SMILES' 
    format in "Preview" tab (e.g. C1(C)C(O)=CC(S)=C(N)C=1>Cl>C1(Br)C(C)=CC(I)=C(O)C=1 
    where specifying reactant, agent and product molecule(s) separated by the "greater-than" symbol ('>').
    */
    await openFileAndAddToCanvas('benzene-arrow-benzene-reagent-hcl.ket', page);

    await getPreviewForSmiles(page, 'MDL Rxnfile V2000', 'Extended SMILES');
  });

  test('Open from file in "Daylight SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4669
    Description: Reagent 'Cl' above the reaction arrow
    */
    await openFileAndAddToCanvas('daylight-smiles-expect.smi', page);
  });

  test('Open from file in "Extended SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4670
    Description: Reagent 'Cl' above the reaction arrow
    */
    await openFileAndAddToCanvas('extended-smiles-expect.cxsmi', page);
  });

  test('Paste from clipboard in "Daylight SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4667
    Description: Reagent 'Cl' displays below reaction arrow
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1(C)C(O)=CC(S)=C(N)C=1>Cl>C1(Br)C(C)=CC(I)=C(O)C=1',
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Paste from clipboard in "Extended SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4668
    Description: Reagent 'Cl' displays above reaction arrow
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'CN(C(Cl)=O)C>Cl>c1ccc(OCCN(C(Cl)=O)C)cc1',
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('SMILES import if dearomotize-on-load is true', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5254
    Description: Aromatic Benzene ring transforms into non aromatic Benzene ring
    */
    await enableDearomatizeOnLoad(page);
    await setMolecule(page, 'c1ccccc1');
  });
});

test.describe('Reagents SMILES format', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('File saves in "Daylight SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4665
    Description: File saved in format (e.g. "ketcher.smi")
    */
    await openFileAndAddToCanvas(
      'Ket/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    const smiFileExpected = await readFileContents(
      'tests/test-data/daylight-smiles-expected.smi',
    );
    const smiFile = await getSmiles(page);
    expect(smiFile).toEqual(smiFileExpected);

    await saveDaylightSmiles(page);
  });

  test('File saves in "Extended SMILES" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4666
    Description: File saved in format (e.g. "ketcher.cxsmi")
    */
    await openFileAndAddToCanvas(
      'Ket/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );

    const smiFileExpected = await readFileContents(
      'tests/test-data/extended-smiles.cxsmi',
    );
    const smiFile = await getExtendedSmiles(page);
    expect(smiFile).toEqual(smiFileExpected);

    await saveExtendedSmiles(page);
  });
});
