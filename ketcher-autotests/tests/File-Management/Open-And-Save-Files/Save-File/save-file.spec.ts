/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  AtomButton,
  DELAY_IN_SECONDS,
  FILE_TEST_DATA,
  RingButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  delay,
  drawBenzeneRing,
  openFileAndAddToCanvas,
  openPasteFromClipboard,
  pasteFromClipboardAndAddToCanvas,
  pressButton,
  receiveFileComparisonData,
  saveToFile,
  selectAtomInToolbar,
  selectOptionByText,
  selectRingButton,
  selectTopPanelButton,
  takeEditorScreenshot,
} from '@utils';
import { drawReactionWithTwoBenzeneRings } from '@utils/canvas/drawStructures';
import {
  getInChIKey,
  getKet,
  getMolfile,
  getRxn,
  getSdf,
  getSmiles,
} from '@utils/formats';

const RING_OFFSET = 150;
const ARROW_OFFSET = 20;
const ARROW_LENGTH = 100;

async function getPreviewForSmiles(
  page: Page,
  formatName: string,
  smileType: string,
) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: formatName }).click();
  await page.getByRole('option', { name: smileType }).click();
}

test.describe('Save files', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Save file - Save *.rxn file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1849
     * Description: Reaction is saved correctly in .rxn file
     */

    await drawReactionWithTwoBenzeneRings(
      page,
      RING_OFFSET,
      ARROW_OFFSET,
      ARROW_LENGTH,
    );

    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile('rxn-1849-to-compare-expectedV2000.rxn', expectedFile);

    const METADATA_STRING_INDEX = [2, 7, 25];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/rxn-1849-to-compare-expectedV2000.rxn',
        metaDataIndexes: METADATA_STRING_INDEX,
        fileFormat: 'v2000',
      });

    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Save file - Save *.mol file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1848
     * Description: Structure (benzine ring) is saved correctly to .mol format
     */

    await drawBenzeneRing(page);

    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile('mol-1848-to-compare-expectedV2000.mol', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/mol-1848-to-compare-expectedV2000.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Save file - Save *.ket file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2934
     * Description: Sctuctures are saved correctly in .ket file
     */

    await drawReactionWithTwoBenzeneRings(
      page,
      RING_OFFSET,
      ARROW_OFFSET,
      ARROW_LENGTH,
    );

    const expectedFile = await getKet(page);
    await saveToFile('KET/ket-2934-to-compare-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/ket-2934-to-compare-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Click and Save as *.smi file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1851
    Description: Click the 'Save As' button, save as Smiles file ('Daylight SMILES' format).
    */
    await openFileAndAddToCanvas('KET/two-benzene-connected.ket', page);
    const expectedFile = await getSmiles(page);
    await saveToFile('KET/two-benzene-connected-expected.smi', expectedFile);
    const { fileExpected: smiFileExpected, file: smiFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/two-benzene-connected-expected.smi',
      });
    expect(smiFile).toEqual(smiFileExpected);
  });

  test('Save as a .rxn file if reaction consists of two or more reaction arrows', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4729
    Description: Structure reaction consists of two or more reaction arrows saved as .rxn file
    */
    await openFileAndAddToCanvas('KET/two-arrows-and-plus.ket', page);
    const expectedFile = await getRxn(page);
    await saveToFile(
      'Rxn-V2000/two-arrows-and-plus-expected.rxn',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [2, 7, 25, 32, 54];
    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/Rxn-V2000/two-arrows-and-plus-expected.rxn',
      });
    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Automatic selection of MDL Molfile v3000 encoding is work if the number of atoms (or bonds) exceeds 999', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-5260
     * Description: Structure is saved according to automated selected format MDL Molfile v3000
     */

    await openFileAndAddToCanvas(
      'Molfiles-V3000/structure-where-atoms-exceeds999.mol',
      page,
    );
    // Very large structure. After we change delay to waitingForRender.
    await delay(DELAY_IN_SECONDS.EIGHT);
    const expectedFile = await getMolfile(page);
    await saveToFile(
      'Molfiles-V3000/structure-where-atoms-exceeds999-expected.mol',
      expectedFile,
    );
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/structure-where-atoms-exceeds999-expected.mol',
        metaDataIndexes: METADATA_STRING_INDEX,
      });
    expect(molFile).toEqual(molFileExpected);
  });

  test('The file formats in the Save Structure window match the mockup', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4739
    Description: File formats in the Save Structure window match the mockup
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByText('MDL Molfile V2000').click();
  });

  test('An atom or structure copied to the clipboard is saved without coordinates', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8921
      Description: In the save window that opens, in the preview section, 
      the atom or structure has no coordinates because they were not added to the canvas.
    */
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await selectTopPanelButton(TopPanelButton.Save, page);

    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile('nitrogen-atom-under-cursor-expected.mol', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/nitrogen-atom-under-cursor-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test.fixme(
    'Support for exporting to "InChiKey" file format',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-18030
       * Description: Save file - InChiKey for Benzene ring on canvas
       */
      // Can't select TestId because after press drop-down menu there is no InchIKey.
      await selectRingButton(RingButton.Benzene, page);
      await clickInTheMiddleOfTheScreen(page);
      await selectTopPanelButton(TopPanelButton.Save, page);
      await pressButton(page, 'MDL Molfile V2000');
      await selectOptionByText(page, 'InChIKey');
      const inChistring = await page
        .getByTestId('preview-area-text')
        .inputValue();
      expect(inChistring).toEqual('UHOVQNZJYSORNB-UHFFFAOYSA-N');
    },
  );

  test.fixme('Save "InChiKey" file format', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-18031
     * Description: Save file - InChiKey for Benzene ring on canvas
     */
    // After 'getInChIKey' return JSON instead InChIKey
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    const expectedFile = await getInChIKey(page);
    await saveToFile('benzene-ring-expected.inchikey', expectedFile);

    const { fileExpected: inchikeyFileExpected, file: inchikeyFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/benzene-ring-expected.inchikey',
      });

    expect(inchikeyFile).toEqual(inchikeyFileExpected);
  });

  test('Support for exporting to "SDF V2000" file format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-18031
      Description: Structure saves in SDF V2000 format
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    const expectedFile = await getSdf(page, 'v2000');
    await saveToFile('SDF/chain-expected.sdf', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/SDF/chain-expected.sdf',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Support for exporting to "SDF V3000" file format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-18031
      Description: Structure saves in SDF V3000 format
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    const expectedFile = await getSdf(page, 'v3000');
    await saveToFile('SDF/chain-expectedV3000.sdf', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/SDF/chain-expectedV3000.sdf',
        fileFormat: 'v3000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });
});

test.describe('Open/Save/Paste files', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Paste the content from mol-string', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1844
      Description: MolFile is pasted to canvas
      */
    await openPasteFromClipboard(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV2000,
    );
    await pressButton(page, 'Add to Canvas');
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Paste from clipboard in "Daylight SMILES" format structure with attachment point and query features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1846
    Description: Daylight SMILES is pasted to canvas with attachment point and query features
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1%91C(O)=C(C2[CH]=CC(C)=CC=2N)C(C)=CC=1.[*:1]%91 |$;;;;;;;;;;;;;;;;_AP1$,rb:10:2,u:10,s:10:*|',
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Paste from clipboard in "Extended SMILES" format structure with attachment point and query features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1846
    Description: Extended SMILES is pasted to canvas with attachment point and query features
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1%91C(O)=C(C2[CH]=CC(C)=CC=2N)C(C)=C%92C=1O1C=CN=CC=1.[*:1]%91.[*:2]%92 |$;;;;;;;;;;;;;;;;;;;;;;_AP1;_AP2$,rb:10:2,u:10,s:10:*|',
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Paste from clipboard in "InChi" format structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1847
    Description: InChi is pasted to canvas
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'InChI=1S/C16H18/c1-11-5-12(2)8-15(7-11)16-9-13(3)6-14(4)10-16/h5-10H,1-4H3',
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Save structure with SVG format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-2253
      Description: File is shown in the preview
    */
    await openFileAndAddToCanvas('KET/two-benzene-connected.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'MDL Molfile V2000' }).click();
    await page.getByRole('option', { name: 'SVG Document' }).click();
  });

  test('Save structure with PNG format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-2254
      Description: File is shown in the preview
    */
    await openFileAndAddToCanvas('KET/two-benzene-connected.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'MDL Molfile V2000' }).click();
    await page.getByRole('option', { name: 'PNG Image' }).click();
  });

  test('Saving structure with QUERY in Smiles format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3944
    Description: Message is shown: The message should be: "Structure contains query properties 
    of atoms and bonds that are not supported in the SMILES. 
    Query properties will not be reflected in the file saved."
    */
    await openFileAndAddToCanvas('Molfiles-V2000/attached-data.mol', page);

    await getPreviewForSmiles(page, 'MDL Molfile V2000', 'Daylight SMILES');
    await page.getByText('Warnings').click();
  });
});
