import { expect, test } from '@playwright/test';
import {
  AtomButton,
  delay,
  readFileContents,
  selectAtomInToolbar,
  takeEditorScreenshot,
  DELAY_IN_SECONDS,
  FILE_TEST_DATA,
  receiveFileComparisonData,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  addFragment,
  disableQueryElements,
  enableDearomatizeOnLoad,
  getMolfile,
  setMolecule,
} from '@utils/formats';

function filteredFile(file: string, filteredIndex: number): string {
  return file
    .split('\n')
    .filter((_str, index) => index > filteredIndex)
    .join('\n')
    .replace(/\s+/g, '');
}

test.describe('Tests for API setMolecule/getMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await delay(DELAY_IN_SECONDS.FIVE);
  });

  test.afterEach(async ({ page }) => {
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeEditorScreenshot(page);
  });

  test('Add molecule through API ketcher.setMolecule', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2957
    Description: Molecule of Benzene is on canvas
    */
    await setMolecule(page, 'C1C=CC=CC=1');
  });

  test('Add SMILES molecule using ketcher.setMolecule() method', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10090
    Description: Molecule of aromatized Benzene is on canvas
    */
    await setMolecule(page, 'c1ccccc1');
  });

  test('Structure import if dearomotize-on-load is true', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10091
    Description: Aromatic Benzene ring loads as non aromatic Benzene ring
    */
    await enableDearomatizeOnLoad(page);
    await setMolecule(page, 'c1ccccc1');
  });

  test('Add a molecule with custom atom properties using ketcher.setMolecule() method', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET- 10092
    Description: Molecule with custom atom properties added to canvas
    */
    await setMolecule(page, 'CCCC |Sg:gen:0,1,2:|');
  });

  test('Add a molecule with custom atom properties', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10092
    Description: Molecule with custom atom properties added to canvas
    */
    await setMolecule(page, 'CCCC |Sg:n:0,1,2:3-6:eu|');
  });

  test('Add a fragment using ketcher.addFragment() method', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET- 10093
    Description:  Fragment is added to canvas.
    */
    await addFragment(page, 'c1ccccc1');
  });

  test('Add molecules with specified SMARTS patterns using ketcher.setMolecule() method', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET- 10094
    Description:  The molecules with specified SMARTS patterns are successfully added to the Ketcher canvas.
    */
    await setMolecule(page, '[#6]~[#6]~[#6]');
  });

  test('Add molecules with specified SMARTS patterns', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10094
    Description:  The molecules with specified SMARTS patterns are successfully added to the Ketcher canvas.
    */
    await setMolecule(page, '[#6]=,:[#6]');
  });

  test('Add complex molecule', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10096
    Description:  Complex molecule added to canvas
    */
    await setMolecule(page, 'Brc1ccc(COC(Cn2ccnc2)c2ccc(Cl)cc2Cl)c(Cl)c1');
  });

  test('Set and Get Molecule using V3000 Molfile format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10095
    Description:  Molecule set and get using V3000 format
    */
    const ignoredLineIndigo = 1;
    const orEnantiomer = await readFileContents(
      'tests/test-data/or-enantiomer.mol',
    );
    await setMolecule(page, orEnantiomer);

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/test-data-for-enatiomer.mol',
        metaDataIndexes: [ignoredLineIndigo],
        fileFormat: 'v3000',
      });
    expect(molFile).toEqual(molFileExpected);
  });

  test('Set and Get Molecule containing chiral centers', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 10097
    Description:  Molecule set and get with chiral centers
    */
    const indexOfLineWithIndigo = 2;
    const indexOfLineWithKetcher = 2;

    await setMolecule(page, 'CC(=O)O[C@@H](C)[C@H](O)Cn1cnc2c1ncnc2N');
    await delay(DELAY_IN_SECONDS.THREE);

    const molV2000FileExpected = await readFileContents(
      'tests/test-data/test-data-for-chiral-centersv2000.json',
    );
    const molV2000File = await getMolfile(page, 'v2000');
    const filteredmolV2000FileExpected = filteredFile(
      molV2000FileExpected,
      indexOfLineWithKetcher,
    );
    const filteredmolV2000File = filteredFile(
      molV2000File,
      indexOfLineWithKetcher,
    );

    expect(filteredmolV2000File).toEqual(filteredmolV2000FileExpected);

    const molV3000FileExpected = await readFileContents(
      'tests/test-data/test-data-for-chiral-centersv3000.json',
    );
    const molV3000File = await getMolfile(page, 'v3000');
    const filteredmolV3000FileExpected = filteredFile(
      molV3000FileExpected,
      indexOfLineWithIndigo,
    );
    const filteredmolV3000File = filteredFile(
      molV3000File,
      indexOfLineWithIndigo,
    );

    expect(filteredmolV3000File).toEqual(filteredmolV3000FileExpected);
  });

  test('Check DisableQueryElements parameter', async ({ page }) => {
    /*
    Test case: EPMLSOPKET- 11854
    Description:  Elements ["Pol", "CYH", "CXH"] disabled and show tooltip: '{elementName}'
    */
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
    await setMolecule(
      page,
      FILE_TEST_DATA.functionalGroupsExpandedContractedV2000,
    );
  });

  test('Add Unknown superatom expanded/contracted through API ketcher.setMolecule', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13012
    Description: Unknown superatom expanded/contracted added through API ketcher.setMolecule
    */
    await setMolecule(
      page,
      FILE_TEST_DATA.unknownSuperatomExpandedContractedV2000,
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
    await setMolecule(page, FILE_TEST_DATA.oneUnknownSuperatomContractedV2000);
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
    await setMolecule(page, FILE_TEST_DATA.oneUnknownSuperatomExpandedV2000);
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
    await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupContractedV2000);
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
    await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupExpandedV2000);
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
    await setMolecule(
      page,
      FILE_TEST_DATA.functionalGroupsExpandedContractedV3000,
    );
  });

  test('Add Unknown superatom expanded/contracted through API ketcher.setMolecule (V3000)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13018
    Description: Unknown superatom expanded/contracted added through API ketcher.setMolecule
    */
    await setMolecule(
      page,
      FILE_TEST_DATA.unknownSuperatomExpandedContractedV3000,
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
    await setMolecule(page, FILE_TEST_DATA.oneUnknownSuperatomContractedV3000);
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
    await setMolecule(page, FILE_TEST_DATA.oneUnknownSuperatomExpandedV3000);
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
    await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupContractedV3000);
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
    await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupExpandedV3000);
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
    await setMolecule(
      page,
      FILE_TEST_DATA.functionalGroupsExpandedContractedKet,
    );
  });

  test('Add Unknown superatom expanded/contracted through API ketcher.setMolecule (.ket)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13024
    Description: Unknown superatom expanded/contracted added through API ketcher.setMolecule
    */
    await setMolecule(
      page,
      FILE_TEST_DATA.unknownSuperatomExpandedContractedKet,
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
    await setMolecule(page, FILE_TEST_DATA.oneUnknownSuperatomContractedKet);
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
    await setMolecule(page, FILE_TEST_DATA.oneUnknownSuperatomExpandedKet);
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
    await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupContractedKet);
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
    await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupExpandedKet);
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
    await setMolecule(
      page,
      FILE_TEST_DATA.functionalGroupsExpandedContractedCml,
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
    await setMolecule(page, FILE_TEST_DATA.oneFunctionalGroupContractedCml);
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
    await setMolecule(
      page,
      FILE_TEST_DATA.unknownSuperatomExpandedContractedCml,
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
    await setMolecule(page, FILE_TEST_DATA.oneUnknownSuperatomContractedCml);
    await takeEditorScreenshot(page);

    await page.getByText('Some Name').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
  });
});
