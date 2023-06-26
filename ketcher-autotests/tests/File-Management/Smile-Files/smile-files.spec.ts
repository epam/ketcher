import { Page, expect, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  delay,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  readFileContents,
  pasteFromClipboard,
  pressButton,
  clickInTheMiddleOfTheScreen,
  DELAY_IN_SECONDS,
  waitForLoad,
} from '@utils';
import { getSmiles } from '@utils/formats';

async function getPreviewForSmiles(
  page: Page,
  formatName: string,
  smileType: string
) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await waitForLoad(page, () => {
    page.getByRole('button', { name: formatName }).click();
  });
  await page.getByRole('option', { name: smileType }).click();
}

async function getAndCompareSmiles(page: Page, smilesFilePath: string) {
  const smilesFileExpected = await readFileContents(smilesFilePath);
  console.log('smilesFileExpected', smilesFileExpected);
  let smilesFile;
  await waitForLoad(page, () => {
    smilesFile = getSmiles(page);
  });
  console.log('smilesFile', smilesFile);
  expect(smilesFile).toEqual(smilesFileExpected);
}

async function clearCanvasAndPasteSmiles(page: Page, smiles: string) {
  await pressButton(page, 'Cancel');
  await selectTopPanelButton(TopPanelButton.Clear, page);
  await selectTopPanelButton(TopPanelButton.Open, page);
  await page.getByText('Paste from clipboard').click();
  await pasteFromClipboard(page, smiles);
  await waitForLoad(page, () => {
    pressButton(page, 'Add to Canvas');
  });
  await clickInTheMiddleOfTheScreen(page);
}

test.describe('SMILES files', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (message) => {
      console.log(`[${message.type()}] ${message.text()}`);
    });
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('SmileString for structure with Bond properties', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1906
    Description: SmileString is correctly generated from structure and vise 
    versa structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas('all-type-bonds.ket', page);
    // await getAndCompareSmiles(
    //   page,
    //   'tests/test-data/smiles-all-bonds-expected.txt'
    // );
    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'CCCCC/CC/C:CC.C(C)CCCCCCCCCC');
  });

  test.skip('SmileString for structure with Atom properties', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1907
    Description: SmileString is correctly generated from structure and 
    vise versa structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas('all-atoms-properties.ket', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/smiles-all-atoms-properties-expected.json'
    );

    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCCCC[C+][1C]C[CH]CC |^1:3,^3:4,^4:5,rb:8:*|'
    );
  });

  test.skip('SmileString from mol file that contains abbreviation', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1908
    Description: <<In Daylight SMILES the structure will be saved without S-groups>>  
    warning appears for all types of Sgroup except the multiple Sgroup type.
    */
    await openFileAndAddToCanvas('sec_butyl_abr.mol', page);

    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await delay(DELAY_IN_SECONDS.TWO);
    await page.getByText('Warnings').click();
  });

  test.skip('SmileString  from mol file that contains Sgroup', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1914
    Description: In Daylight SMILES the structure will be saved without S-groups
    */
    await openFileAndAddToCanvas('sgroups-diff-symyx.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/sgroups-diff-symyx-expected.json'
    );

    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await delay(DELAY_IN_SECONDS.ONE);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCCCCCCCCCCC.CCCCCCC.CCCCCCC.CCCCCCC.CCCCCCC |Sg:gen:16,17,15:,Sg:n:23,24,22:n:ht|'
    );
  });

  test.skip('SmileString from mol file that contains Heteroatoms', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1915
    Description: SmileString is correctly generated from structure and 
    vise versa structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/smiles-heteroatoms-expected.json'
    );

    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'NOSPFClBrI[H]');
  });

  test.skip('SmileString from mol file that contains attached data', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1916
    Description: Warning tab: Structure contains query properties of atoms 
    and bonds that are not supported in the SMILES. Query properties will not be reflected in the saved file
    */
    await openFileAndAddToCanvas('Attached data.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/attached-data-expected.json'
    );

    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await page.getByText('Warnings').click();
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'CCCC[C@@H](C)[C@@H](C)CC');
  });

  test.skip('SmileString  from V2000 mol file contains abs stereochemistry', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1917
    Description: SmileString is correctly generated from structure and vise versa 
    structure is correctly generated from SmileString. 
    All stereobonds are displayed as in a mol-file.
    */
    await openFileAndAddToCanvas('V2000_abs.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/smiles-v2000-abs-expected.json'
    );

    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      // eslint-disable-next-line max-len
      '[C@]12(OC(C)=O)C[C@H](C)[C@H](OC(CC3C=CC=CC=3)=O)[C@]1([H])[C@H](OC(C)=O)[C@@]1(CC[C@]3([H])C(C)(C)[C@]3([H])C=C(C)C2=O)CO1 |c:39|'
    );
  });

  test.skip('SmileString from mol file that contains combination of different features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1920
    Description: SmileString is correctly generated from structure and vise versa structure is 
    correctly generated from SmileString.
    Structure appears without attached data and brackets, query features, 
    Rgroup labels are rendered as R# symbols.
    */
    await openFileAndAddToCanvas('different-features.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/smiles-different-features-expected.json'
    );

    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      // eslint-disable-next-line max-len
      'S=CC(F)CCCCC[C@@](CCO)/C=C/[C@@](N)CCC[C]C([13C]CC([C+2]CC(CC%91)CC(C)CCC)CCC)CC%92.[*:2]%92.[*:1]%91 |$;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;_R2;_R1$,rb:32:*,u:3|'
    );
  });

  test.skip('SmileString from file that contains Cis/Trans configuration', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1923
    Description: SmileString is correctly generated from structure and vise versa 
    structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas('cis-trans-cycle.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/smiles-cis-trans-cycle-expected.json'
    );

    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'C1CC=CC=CC=CCC=CC=CC=CCC=CC=C1 |c:2,11,16,t:4,6,9,13,18|'
    );
  });

  test.skip('SmileString from file that contains alias and pseudoatom', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1924
    Description: The structure generated from SMILE string is correct, 
    pseudoatoms are rendered, alias appears as common atom symbol for which this alias was assigned.
    */
    await openFileAndAddToCanvas('alias-pseudoatom.ket', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/smiles-alias-pseudoatom-expected.json'
    );

    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, '');
  });

  test.skip('SmileString from reaction consists of two or more reaction arrows and structures', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8905
    Description: Structure is correctly opens from saved files. Keep only first reaction arrow 
    and keep all structures (all intermediate structures should be products and the arrow is replaced by a plus)
    */
    await openFileAndAddToCanvas('two-arrows-and-plus.ket', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/smiles-two-arrows-and-plus-expected.json'
    );

    await getPreviewForSmiles(page, 'MDL Rxnfile V2000', 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'C1C=CC=CC=1.O>>C1C=CC(C)=CC=1C.C1C=CC(C)=CC=1C'
    );
  });

  test.skip('Open Daylight SMILES file with reagent above arrow', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12965
    Description: Structure is not distorted. Reagent NH3 located above reaction arrow.
    */
    await openFileAndAddToCanvas('benzene-arrow-benzene-reagent-nh3.ket', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/smiles-benzene-arrow-benzene-reagent-nh3-expected.json'
    );

    await getPreviewForSmiles(page, 'MDL Rxnfile V2000', 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'C1C=CC=CC=1>N>C1C=CC=CC=1');
  });
});
