import { Page, expect, test } from '@playwright/test';
import {
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
  saveToFile,
  receiveFileComparisonData,
  openFileAndAddToCanvasAsNewProject,
  moveMouseAway,
} from '@utils';
import {
  selectClearCanvasTool,
  selectOpenFileTool,
  selectSaveTool,
} from '@tests/pages/common/TopLeftToolbar';
import {
  clickOnFileFormatDropdown,
  getExtendedSmiles,
  getSmiles,
} from '@utils/formats';

async function getPreviewForSmiles(page: Page, smileType: string) {
  await selectSaveTool(page);
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
  await selectClearCanvasTool(page);
  await selectOpenFileTool(page);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'CCCCC/CC/C:CC.C(C)CCCCCCCCCC');
    await takeEditorScreenshot(page);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCCCC[C+][1C]C[CH]CC |^1:3,^3:4,^4:5,rb:8:*|',
    );
    await takeEditorScreenshot(page);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCCCCCCCCCCC.CCCCCCC.CCCCCCC.CCCCCCC.CCCCCCC |Sg:gen:16,17,15:,Sg:n:23,24,22:n:ht,SgD:38,37,36:fgfh:dsfsd::: :|',
    );
    await takeEditorScreenshot(page);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'NOSPFClBrI[H]');
    await takeEditorScreenshot(page);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'CCCC[C@@H](C)[C@@H](C)CC |SgD:4,5:Purity:Purity = 96%::: :|',
    );
    await takeEditorScreenshot(page);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      // eslint-disable-next-line max-len
      '[C@]12(OC(C)=O)C[C@H](C)[C@H](OC(CC3C=CC=CC=3)=O)[C@]1([H])[C@H](OC(C)=O)[C@@]1(CC[C@]3([H])C(C)(C)[C@]3([H])C=C(C)C2=O)CO1 |c:39|',
    );
    await takeEditorScreenshot(page);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      // eslint-disable-next-line max-len
      'S=CC(F)CCCCC[C@@](CCO)/C=C/[C@@](N)CCC[C]C([13C]CC([C+2]CC(CC%91)CC(C)CCC)CCC)CC%92.[*:2]%92.[*:1]%91 |$;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;_R2;_R1$,rb:32:*,u:3|',
    );
    await takeEditorScreenshot(page);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(
      page,
      'C1CC=CC=CC=CCC=CC=CC=CCC=CC=C1 |c:2,11,16,t:4,6,9,13,18|',
    );
    await takeEditorScreenshot(page);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'CCCC*CC |$;;alias123;;GH*;;$|');
    await takeEditorScreenshot(page);
  });

  test.fail(
    'SmileString from reaction consists of two or more reaction arrows and structures',
    async ({ page }) => {
      /*
       * IMPORTANT: Test fails because we have bug https://github.com/epam/ketcher/issues/5641
       * Test case: EPMLSOPKET-8905
       * Description: Structure is correctly opens from saved files. Keep only first reaction arrow
       * and keep all structures (all intermediate structures should be products and the arrow is replaced by a plus)
       */
      await openFileAndAddToCanvas('KET/two-arrows-and-plus.ket', page);
      await getAndCompareSmiles(
        page,
        'tests/test-data/JSON/smiles-two-arrows-and-plus-expected.json',
      );

      await getPreviewForSmiles(page, 'Daylight SMILES');
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await clearCanvasAndPasteSmiles(
        page,
        'C1C=CC=CC=1.O>>C1C=CC(C)=CC=1C.C1C=CC(C)=CC=1C',
      );
      await takeEditorScreenshot(page);
    },
  );

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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await clearCanvasAndPasteSmiles(page, 'C1C=CC=CC=1>N>C1C=CC=CC=1');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
  });

  test('Stereobond is preserved after pasting a SMILES structure', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1300
    Description: The Single Down stereo bond is on the structure
    */
    await pasteFromClipboardAndAddToCanvas(page, 'C1=C(C)C(=O)C[S@]1=O');
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-chems.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/unsplit-nucleotides-connected-with-chems.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/unsplit-nucleotides-connected-with-chems.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/unsplit-nucleotides-connected-with-chems.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/unsplit-nucleotides-connected-with-nucleotides.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/unsplit-nucleotides-connected-with-nucleotides.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/unsplit-nucleotides-connected-with-nucleotides.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-bases.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/unsplit-nucleotides-connected-with-bases.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/unsplit-nucleotides-connected-with-bases.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/unsplit-nucleotides-connected-with-bases.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/unsplit-nucleotides-connected-with-sugars.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/unsplit-nucleotides-connected-with-sugars.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/unsplit-nucleotides-connected-with-sugars.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/unsplit-nucleotides-connected-with-peptides.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/unsplit-nucleotides-connected-with-peptides.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/unsplit-nucleotides-connected-with-peptides.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/unsplit-nucleotides-connected-with-phosphates.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/unsplit-nucleotides-connected-with-phosphates.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/unsplit-nucleotides-connected-with-phosphates.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to Extended SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to extended SMILE and loaded back
    */
    test.fail();
    // function await getExtendedSmiles but get JSON instead cxsmi file
    // after fixing need to update the screenshot

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-chems.ket',
      page,
    );
    const expectedFile = await getExtendedSmiles(page);
    await saveToFile(
      'Extended-SMILES/unsplit-nucleotides-connected-with-chems.cxsmi',
      expectedFile,
    );
    const {
      fileExpected: extendedsmilesFileExpected,
      file: extendedsmilesFile,
    } = await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Extended-SMILES/unsplit-nucleotides-connected-with-chems.cxsmi',
    });

    expect(extendedsmilesFile).toEqual(extendedsmilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'Extended-SMILES/unsplit-nucleotides-connected-with-chems.cxsmi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with other nucleotides could be saved to Extended SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with other nucleotides could be saved to extended SMILE and loaded back
    */
    test.fail();
    // function await getExtendedSmiles but get JSON instead cxsmi file
    // after fixing need to update the screenshot

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );
    const expectedFile = await getExtendedSmiles(page);
    await saveToFile(
      'Extended-SMILES/unsplit-nucleotides-connected-with-nucleotides.cxsmi',
      expectedFile,
    );
    const {
      fileExpected: extendedsmilesFileExpected,
      file: extendedsmilesFile,
    } = await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Extended-SMILES/unsplit-nucleotides-connected-with-nucleotides.cxsmi',
    });

    expect(extendedsmilesFile).toEqual(extendedsmilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'Extended-SMILES/uunsplit-nucleotides-connected-with-nucleotides.cxsmi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to Extended SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to extended SMILE and loaded back
    */
    test.fail();
    // function await getExtendedSmiles but get JSON instead cxsmi file
    // after fixing need to update the screenshot

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-bases.ket',
      page,
    );
    const expectedFile = await getExtendedSmiles(page);
    await saveToFile(
      'Extended-SMILES/unsplit-nucleotides-connected-with-bases.cxsmi',
      expectedFile,
    );
    const {
      fileExpected: extendedsmilesFileExpected,
      file: extendedsmilesFile,
    } = await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Extended-SMILES/unsplit-nucleotides-connected-with-bases.cxsmi',
    });

    expect(extendedsmilesFile).toEqual(extendedsmilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'Extended-SMILES/unsplit-nucleotides-connected-with-bases.cxsmi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the simple schema with retrosynthetic arrow could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/simple-schema-with-retrosynthetic-arrow.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/simple-schema-with-retrosynthetic-arrow.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/simple-schema-with-retrosynthetic-arrow.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test.fail(
    'Validate that the schema with retrosynthetic, angel arrows and plus could be saved to SMILE file and loaded back',
    async ({ page }) => {
      /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    We have a bug https://github.com/epam/Indigo/issues/2210
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
        page,
      );
      const expectedFile = await getSmiles(page);
      await saveToFile(
        'SMILES/schema-with-retrosynthetic-angel-arrows-and-plus.smi',
        expectedFile,
      );
      const { fileExpected: smilesFileExpected, file: smilesFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/SMILES/schema-with-retrosynthetic-angel-arrows-and-plus.smi',
        });

      expect(smilesFile).toEqual(smilesFileExpected);

      await openFileAndAddToCanvasAsNewProject(
        'SMILES/schema-with-retrosynthetic-angel-arrows-and-plus.smi',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Validate that the schema with vertical retrosynthetic arrow could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-vertical-retrosynthetic-arrow.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/schema-with-vertical-retrosynthetic-arrow.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/schema-with-vertical-retrosynthetic-arrow.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/schema-with-vertical-retrosynthetic-arrow.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-two-retrosynthetic-arrows.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/schema-with-two-retrosynthetic-arrows.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/schema-with-two-retrosynthetic-arrows.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/schema-with-two-retrosynthetic-arrows.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with diagonaly retrosynthetic arrow could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/schema-with-diagonal-retrosynthetic-arrow.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/schema-with-diagonal-retrosynthetic-arrow.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/schema-with-diagonal-retrosynthetic-arrow.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to SMILE file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMILE file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
      page,
    );
    const expectedFile = await getSmiles(page);
    await saveToFile(
      'SMILES/schema-with-reverse-retrosynthetic-arrow-and-pluses.smi',
      expectedFile,
    );
    const { fileExpected: smilesFileExpected, file: smilesFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMILES/schema-with-reverse-retrosynthetic-arrow-and-pluses.smi',
      });

    expect(smilesFile).toEqual(smilesFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMILES/schema-with-reverse-retrosynthetic-arrow-and-pluses.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
