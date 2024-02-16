import { Page, expect, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  readFileContents,
  pasteFromClipboard,
  pressButton,
  clickInTheMiddleOfTheScreen,
  waitForLoad,
  waitForPageInit,
  nonEmptyString,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';
import { clickOnFileFormatDropdown, getSmiles } from '@utils/formats';

async function getPreviewForSmiles(page: Page, smileType: string) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await clickOnFileFormatDropdown(page);
  await page.getByRole('option', { name: smileType }).click();
  const previewInput = page.getByTestId('smiles-preview-area-text');
  await previewInput.waitFor({ state: 'visible' });
  await expect(previewInput).toContainText(nonEmptyString);
}

async function getAndCompareSmiles(page: Page, smilesFilePath: string) {
  const smilesFileExpected = await readFileContents(smilesFilePath);
  const smilesFile = await getSmiles(page);
  expect(smilesFile).toEqual(smilesFileExpected);
}

async function clearCanvasAndPasteSmiles(page: Page, smiles: string) {
  await pressButton(page, 'Cancel');
  await selectTopPanelButton(TopPanelButton.Clear, page);
  await selectTopPanelButton(TopPanelButton.Open, page);
  await page.getByText('Paste from clipboard').click();
  await pasteFromClipboard(page, smiles);
  await waitForLoad(page, async () => {
    await pressButton(page, 'Add to Canvas');
  });
  await clickInTheMiddleOfTheScreen(page);
}

test.describe('SMILES files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
    await openFileAndAddToCanvas('KET/all-type-bonds.ket', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/smiles-all-bonds-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'CCCCC/CC/C:CC.C(C)CCCCCCCCCC');
  });

  test('SmileString for structure with Atom properties', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1907
    Description: SmileString is correctly generated from structure and
    vise versa structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas('KET/all-atoms-properties.ket', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/smiles-all-atoms-properties-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCCCC[C+][1C]C[CH]CC |^1:3,^3:4,^4:5,rb:8:*|',
    );
  });

  test('SmileString from mol file that contains abbreviation', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1908
    Description: <<In Daylight SMILES the structure will be saved without S-groups>>
    warning appears for all types of Sgroup except the multiple Sgroup type.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/sec-butyl-abr.mol', page);
    await getPreviewForSmiles(page, 'Daylight SMILES');
    await page.getByText('Warnings').click();
  });

  test('SmileString  from mol file that contains Sgroup', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1914
    Description: In Daylight SMILES the structure will be saved without S-groups
    */
    await openFileAndAddToCanvas('Molfiles-V2000/sgroups-diff-symyx.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/sgroups-diff-symyx-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCCCCCCCCCCC.CCCCCCC.CCCCCCC.CCCCCCC.CCCCCCC |Sg:gen:16,17,15:,Sg:n:23,24,22:n:ht,SgD:38,37,36:fgfh:dsfsd::: :|',
    );
  });

  test('SmileString from mol file that contains Heteroatoms', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1915
    Description: SmileString is correctly generated from structure and
    vise versa structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/heteroatoms-structure.mol',
      page,
    );
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/smiles-heteroatoms-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'NOSPFClBrI[H]');
  });

  // flaky
  test('SmileString from mol file that contains attached data', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1916
    Description: Warning tab: Structure contains query properties of atoms
    and bonds that are not supported in the SMILES. Query properties will not be reflected in the saved file
    */
    await openFileAndAddToCanvas('Molfiles-V2000/attached-data.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/attached-data-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await page.getByText('Warnings').click();
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCC[C@@H](C)[C@@H](C)CC |SgD:4,5:Purity:Purity = 96%::: :|',
    );
  });

  test('SmileString from V2000 mol file contains abs stereochemistry', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1917
    Description: SmileString is correctly generated from structure and vise versa
    structure is correctly generated from SmileString.
    All stereobonds are displayed as in a mol-file.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/V2000-abs.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/smiles-v2000-abs-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      // eslint-disable-next-line max-len
      '[C@]12(OC(C)=O)C[C@H](C)[C@H](OC(CC3C=CC=CC=3)=O)[C@]1([H])[C@H](OC(C)=O)[C@@]1(CC[C@]3([H])C(C)(C)[C@]3([H])C=C(C)C2=O)CO1 |c:39|',
    );
  });

  // flaky
  test('SmileString from mol file that contains combination of different features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1920
    Description: SmileString is correctly generated from structure and vise versa structure is
    correctly generated from SmileString.
    Structure appears without attached data and brackets, query features,
    Rgroup labels are rendered as R# symbols.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/different-features.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/smiles-different-features-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      // eslint-disable-next-line max-len
      'S=CC(F)CCCCC[C@@](CCO)/C=C/[C@@](N)CCC[C]C([13C]CC([C+2]CC(CC%91)CC(C)CCC)CCC)CC%92.[*:2]%92.[*:1]%91 |$;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;_R2;_R1$,rb:32:*,u:3|',
    );
  });

  test('SmileString from file that contains Cis/Trans configuration', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1923
    Description: SmileString is correctly generated from structure and vise versa
    structure is correctly generated from SmileString.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/cis-trans-cycle.mol', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/smiles-cis-trans-cycle-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'C1CC=CC=CC=CCC=CC=CC=CCC=CC=C1 |c:2,11,16,t:4,6,9,13,18|',
    );
  });

  test('SmileString from file that contains alias and pseudoatom', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1924
    Description: The structure generated from SMILE string is correct,
    pseudoatoms are rendered, alias appears as common atom symbol for which this alias was assigned.
    */
    await openFileAndAddToCanvas('KET/alias-pseudoatom.ket', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/smiles-alias-pseudoatom-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'CCCC*CC |$;;alias123;;GH*;;$|');
  });

  test('SmileString from reaction consists of two or more reaction arrows and structures', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8905
    Description: Structure is correctly opens from saved files. Keep only first reaction arrow
    and keep all structures (all intermediate structures should be products and the arrow is replaced by a plus)
    */
    await openFileAndAddToCanvas('KET/two-arrows-and-plus.ket', page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/smiles-two-arrows-and-plus-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'C1C=CC=CC=1.O>>C1C=CC(C)=CC=1C.C1C=CC(C)=CC=1C',
    );
  });

  test('Open Daylight SMILES file with reagent above arrow', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12965
    Description: Structure is not distorted. Reagent NH3 located above reaction arrow.
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    await getAndCompareSmiles(
      page,
      'tests/test-data/JSON/smiles-benzene-arrow-benzene-reagent-nh3-expected.json',
    );

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'C1C=CC=CC=1>N>C1C=CC=CC=1');
  });

  test('Open SMILE file with S-Group Properties', async ({ page }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1040
    Description: SMILE file opens and have S-Group Properties
    */
    await openFileAndAddToCanvas(
      'SMILES/structure-with-s-group-properties.smi',
      page,
    );
    await getAndCompareSmiles(
      page,
      'tests/test-data/SMILES/structure-with-s-group-properties.smi',
    );
    await page.getByText('info2').dblclick();
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'CCC |SgD:1:atropisomer:info2::::|');
  });

  test('Stereobond is preserved after pasting a SMILES structure', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1300
    Description: The Single Down stereo bond is on the structure
    */
    await pasteFromClipboardAndAddToCanvas(page, 'C1=C(C)C(=O)C[S@]1=O');
  });

  test('Single Up, Single Down and Single Up/Down stereobonds is preserved after pasting a SMILES structure', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1300
    Description: The Single Up, Single Down and Single Up/Down  stereo bonds is on the structure
    The test result is not what it should be. The behavior requires further clarification.
    Single Down bond changes to Single Up and two other stereobonds dissapear.
    */
    await pasteFromClipboardAndAddToCanvas(page, 'C1[S@](=O)CC(=O)[C@@]=1C');
  });

  test('Enhanced stereo labels on atropisomers are not lost when opening saved Extended SMILES', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1257
    Description: Stereo information for bond and atom is kept
    */
    await openFileAndAddToCanvas(
      'Extended-SMILES/atropoisomer-enhanced-stereo.cxsmi',
      page,
    );
  });
});
