import { expect, test } from '@playwright/test';
import {
  AtomButton,
  readFileContents,
  selectAtomInToolbar,
  takeEditorScreenshot,
  FILE_TEST_DATA,
  receiveFileComparisonData,
  waitForSpinnerFinishedWork,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  saveToFile,
  openFileAndAddToCanvasAsNewProject,
  drawBenzeneRing,
  waitForLoad,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  addFragment,
  disableQueryElements,
  enableDearomatizeOnLoad,
  getMolfile,
  setMolecule,
} from '@utils/formats';

test.describe('Tests for API setMolecule/getMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Add molecule through API ketcher.setMolecule', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2957
    Description: Molecule of Benzene is on canvas
    */
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, 'C1C=CC=CC=1'),
    );
  });

  test('Add SMILES molecule using ketcher.setMolecule() method', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10090
    Description: Molecule of aromatized Benzene is on canvas
    */
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, 'c1ccccc1'),
    );
  });

  test('Structure import if dearomotize-on-load is true', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10091
    Description: Aromatic Benzene ring loads as non aromatic Benzene ring
    */
    await clickInTheMiddleOfTheScreen(page);
    await enableDearomatizeOnLoad(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, 'c1ccccc1'),
    );
  });

  test(
    'Structure import if dearomotize-on-load is true for Mol V2000 file',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: https://github.com/epam/ketcher/issues/4320
    Description: Aromatic Benzene ring loads as non aromatic Benzene ring
    Test working not in proper way because we have bug https://github.com/epam/ketcher/issues/4320
    After fix we need update screenshot.
    */
      const MolV2000File = await readFileContents(
        'tests/test-data/Molfiles-V2000/aromatized-benzene-ring.mol',
      );
      await clickInTheMiddleOfTheScreen(page);
      await enableDearomatizeOnLoad(page);
      await waitForSpinnerFinishedWork(
        page,
        async () => await setMolecule(page, MolV2000File),
      );
    },
  );

  test('Add a molecule with custom atom properties using ketcher.setMolecule() method', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET- 10092
    Description: Molecule with custom atom properties added to canvas
    */
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, 'CCCC |Sg:gen:0,1,2:|'),
    );
  });

  test('Add a molecule with custom atom properties', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10092
    Description: Molecule with custom atom properties added to canvas
    */
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, 'CCCC |Sg:n:0,1,2:3-6:eu|'),
    );
  });

  test('Add a fragment using ketcher.addFragment() method', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET- 10093
    Description:  Fragment is added to canvas.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () => await addFragment(page, 'c1ccccc1'),
    );
  });

  test('Add molecules with specified SMARTS patterns using ketcher.setMolecule() method', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET- 10094
    Description:  The molecules with specified SMARTS patterns are successfully added to the Ketcher canvas.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, '[#6]~[#6]~[#6]'),
    );
  });

  test('Add molecules with specified SMARTS patterns', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10094
    Description:  The molecules with specified SMARTS patterns are successfully added to the Ketcher canvas.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, '[#6]=,:[#6]'),
    );
  });

  test('Add complex molecule', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10096
    Description:  Complex molecule added to canvas
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(page, 'Brc1ccc(COC(Cn2ccnc2)c2ccc(Cl)cc2Cl)c(Cl)c1'),
    );
  });

  test('Set and Get Molecule using V3000 Molfile format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10095
    Description:  Molecule set and get using V3000 format
    */
    const ignoredLineIndigo = 1;
    const orEnantiomer = await readFileContents(
      'tests/test-data/Molfiles-V3000/or-enantiomer.mol',
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, orEnantiomer),
    );

    const expectedFile = await getMolfile(page, 'v3000');
    await saveToFile(
      'Molfiles-V3000/test-data-for-enatiomer.mol',
      expectedFile,
    );

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/test-data-for-enatiomer.mol',
        metaDataIndexes: [ignoredLineIndigo],
        fileFormat: 'v3000',
      });
    expect(molFile).toEqual(molFileExpected);
  });

  test('Set and Get Molecule containing chiral centers V2000', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET- 10097
    Description:  Molecule set and get with chiral centers V2000
    */

    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(page, 'CC(=O)O[C@@H](C)[C@H](O)Cn1cnc2c1ncnc2N'),
    );

    const molV2000File = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/test-data-for-chiral-centersv2000-expected.mol',
      molV2000File,
    );
    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/test-data-for-chiral-centersv2000-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Set and Get Molecule containing chiral centers V3000', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET- 10097
    Description:  Molecule set and get with chiral centers V3000
    */

    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(page, 'CC(=O)O[C@@H](C)[C@H](O)Cn1cnc2c1ncnc2N'),
    );
    const molV3000File = await getMolfile(page, 'v3000');
    await saveToFile(
      'Molfiles-V3000/test-data-for-chiral-centersv3000-expected.mol',
      molV3000File,
    );
    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/test-data-for-chiral-centersv3000-expected.mol',
        fileFormat: 'v3000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Check DisableQueryElements parameter', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 11854
    Description:  Elements ["Pol", "CYH", "CXH"] disabled and show tooltip: '{elementName}'
    */
    // Called to make sure the page has been fully loaded
    await clickInTheMiddleOfTheScreen(page);
    await disableQueryElements(page);
    await selectAtomInToolbar(AtomButton.Extended, page);
  });

  test('Add Functional Groups expanded/contracted through API ketcher.setMolecule', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13011
    Description: Functional Groups expanded/contracted added through API ketcher.setMolecule
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.functionalGroupsExpandedContractedV2000,
        ),
    );
  });

  test('Add Unknown superatom expanded/contracted through API ketcher.setMolecule', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13012
    Description: Unknown superatom expanded/contracted added through API ketcher.setMolecule
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.unknownSuperatomExpandedContractedV2000,
        ),
    );
  });

  test('Add one contracted Unknown Superatom through API ketcher.setMolecule', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13013
    Description: one contracted Unknown Superatom added through API ketcher.setMolecule.
    Unknown Superatom is able to expand.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.oneUnknownSuperatomContractedV2000,
        ),
    );

    await takeEditorScreenshot(page);

    await page.getByText('Some Name').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
  });

  test('Add one expanded Unknown Superatom through API ketcher.setMolecule', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13014
    Description: one expanded Unknown Superatom added through API ketcher.setMolecule.
    Unknown Superatom is able to contract.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.oneUnknownSuperatomExpandedV2000,
        ),
    );

    await takeEditorScreenshot(page);

    // eslint-disable-next-line no-magic-numbers
    const point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Contract Abbreviation').click();
  });

  test('Add one contracted Functional Group through API ketcher.setMolecule', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13015
    Description: one contracted Functional Group added through API ketcher.setMolecule.
    Functional Group is able to expand.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.oneFunctionalGroupContractedV2000,
        ),
    );

    await takeEditorScreenshot(page);

    await page.getByText('Boc').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
  });

  test('Add one expanded Functional Group through API ketcher.setMolecule', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13016
    Description: one expanded Functional Group added through API ketcher.setMolecule.
    Functional Group is able to contract.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupExpandedV2000),
    );

    await takeEditorScreenshot(page);

    // eslint-disable-next-line no-magic-numbers
    const point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Contract Abbreviation').click();
  });

  test('Add Functional Groups expanded/contracted through API ketcher.setMolecule (V3000)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13017
    Description: Functional Groups expanded/contracted added through API ketcher.setMolecule
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.functionalGroupsExpandedContractedV3000,
        ),
    );
  });

  test('Add Unknown superatom expanded/contracted through API ketcher.setMolecule (V3000)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13018
    Description: Unknown superatom expanded/contracted added through API ketcher.setMolecule
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.unknownSuperatomExpandedContractedV3000,
        ),
    );
  });

  test('Add one contracted Unknown Superatom through API ketcher.setMolecule (V3000)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13019
    Description: one contracted Unknown Superatom added through API ketcher.setMolecule.
    Unknown Superatom is able to expand.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.oneUnknownSuperatomContractedV3000,
        ),
    );

    await takeEditorScreenshot(page);

    await page.getByText('Some Name').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
  });

  test('Add one expanded Unknown Superatom through API ketcher.setMolecule (V3000)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13020
    Description: one expanded Unknown Superatom added through API ketcher.setMolecule.
    Unknown Superatom is able to contract.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.oneUnknownSuperatomExpandedV3000,
        ),
    );

    await takeEditorScreenshot(page);

    // eslint-disable-next-line no-magic-numbers
    const point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Contract Abbreviation').click();
  });

  test('Add one contracted Functional Group through API ketcher.setMolecule (V3000)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13021
    Description: one contracted Functional Group added through API ketcher.setMolecule.
    Functional Group is able to expand.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.oneFunctionalGroupContractedV3000,
        ),
    );

    await takeEditorScreenshot(page);

    await page.getByText('Boc').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
  });

  test('Add one expanded Functional Group through API ketcher.setMolecule (V3000)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13022
    Description: one expanded Functional Group added through API ketcher.setMolecule.
    Functional Group is able to contract.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupExpandedV3000),
    );

    await takeEditorScreenshot(page);

    // eslint-disable-next-line no-magic-numbers
    const point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Contract Abbreviation').click();
  });

  test('Add Functional Groups expanded/contracted through API ketcher.setMolecule (.ket)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13023
    Description: Functional Groups expanded/contracted added through API ketcher.setMolecule
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.functionalGroupsExpandedContractedKet,
        ),
    );
  });

  test('Add Unknown superatom expanded/contracted through API ketcher.setMolecule (.ket)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13024
    Description: Unknown superatom expanded/contracted added through API ketcher.setMolecule
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.unknownSuperatomExpandedContractedKet,
        ),
    );
  });

  test('Add one contracted Unknown Superatom through API ketcher.setMolecule (.ket)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13025
    Description: one contracted Unknown Superatom added through API ketcher.setMolecule.
    Unknown Superatom is able to expand.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.oneUnknownSuperatomContractedKet,
        ),
    );

    await takeEditorScreenshot(page);

    await page.getByText('Some Name').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
  });

  test('Add one expanded Unknown Superatom through API ketcher.setMolecule (.ket)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13026
    Description: one expanded Unknown Superatom added through API ketcher.setMolecule.
    Unknown Superatom is able to contract.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(page, FILE_TEST_DATA.oneUnknownSuperatomExpandedKet),
    );

    await takeEditorScreenshot(page);

    // eslint-disable-next-line no-magic-numbers
    const point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Contract Abbreviation').click();
  });

  test('Add one contracted Functional Group through API ketcher.setMolecule (.ket)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13027
    Description: one contracted Functional Group added through API ketcher.setMolecule.
    Functional Group is able to expand.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupContractedKet),
    );

    await takeEditorScreenshot(page);

    await page.getByText('Boc').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
  });

  test('Add one expanded Functional Group through API ketcher.setMolecule (.ket)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13028
    Description: one expanded Functional Group added through API ketcher.setMolecule.
    Functional Group is able to contract.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupExpandedKet),
    );

    await takeEditorScreenshot(page);

    // eslint-disable-next-line no-magic-numbers
    const point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Contract Abbreviation').click();
  });

  test('Add Functional Groups expanded/contracted through API ketcher.setMolecule (CML)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-14257
    Description: Functional Groups added through API ketcher.setMolecule both contracted
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.functionalGroupsExpandedContractedCml,
        ),
    );
  });

  test('Add one contracted Functional Group through API ketcher.setMolecule (CML)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-14258
    Description: one contracted Functional Group added through API ketcher.setMolecule.
    Functional Group is able to expand.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupContractedCml),
    );

    await takeEditorScreenshot(page);

    await page.getByText('Boc').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
  });

  test('Add Unknown superatoms expanded/contracted through API ketcher.setMolecule (CML)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-14260
    Description: Unknown superatoms both added contracted through API ketcher.setMolecule
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.unknownSuperatomExpandedContractedCml,
        ),
    );
  });

  test('Add one contracted Unknown Superatom through API ketcher.setMolecule (CML)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-14261
    Description: one contracted Unknown Superatom added through API ketcher.setMolecule.
    Unknown Superatom is able to expand.
    */
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.oneUnknownSuperatomContractedCml,
        ),
    );

    await takeEditorScreenshot(page);

    await page.getByText('Some Name').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
  });
  test('Check that "containsReaction" method returns "true" if structure has a reaction in micro mode', async ({
    page,
  }) => {
    /**
     * Test case: #3531
     * Description: "containsReaction" method returns "true" if structure has a reaction in micro mode
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    const containsReaction = await page.evaluate(() => {
      return window.ketcher.containsReaction();
    });

    expect(containsReaction).toBe(true);
  });

  test('Check that "containsReaction" method returns "false" if structure has not a reaction in micro mode', async ({
    page,
  }) => {
    /**
     * Test case: #3531
     * Description: "containsReaction" method returns "false" if structure has not a reaction in micro mode
     */
    await waitForLoad(page, async () => {
      await drawBenzeneRing(page);
    });
    const containsReaction = await page.evaluate(() => {
      return window.ketcher.containsReaction();
    });

    expect(containsReaction).not.toBe(true);
  });
});
