import { Page, test, expect } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  verifySMARTSExport,
  verifySMARTSExportWarnings,
  setBondTopology,
  setBondType,
  setCustomQueryForBond,
  setReactingCenter,
} from '../utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { BondPropertiesDialog } from '@tests/pages/molecules/canvas/BondPropertiesDialog';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';

async function setAndCheckBondProperties(
  page: Page,
  setProperty: (arg0: Page, arg1: string) => Promise<void>,
  value: string,
  expectedSmarts: string,
) {
  await setProperty(page, value);
  await BondPropertiesDialog(page).apply();
  await takeEditorScreenshot(page);
  await verifySMARTSExport(page, expectedSmarts);
}

async function drawStructureAndDoubleClickOnBond(
  page: Page,
  numberOfBond: number,
) {
  await waitForPageInit(page);
  await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await page.keyboard.press('Escape');
  await getBondLocator(page, { bondId: numberOfBond }).dblclick({
    force: true,
  });
  await expect(BondPropertiesDialog(page).window).toBeVisible();
}

async function setCustomQueryAndCheckValue(page: Page, expectedValue: string) {
  await page.getByTestId('custom-query-checkbox').check();
  const customQueryInput = page.getByTestId('bond-custom-query');
  await expect(customQueryInput).toHaveValue(expectedValue);
}

test.describe('Checking bond attributes in SMARTS format', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    const numberOfBond = 0;
    page = await initMoleculesCanvas();
    await drawStructureAndDoubleClickOnBond(page, numberOfBond);
  });

  // Tests for bond type:

  test('Setting bond type - single (aliphatic))', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single-option',
      '[#6](-[#6])(-[#6])-[#6]',
    );
  });

  test('Setting bond type - single up', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single Up-option',
      '[#6](-[#6])(-[#6])/[#6]',
    );
  });

  test('Setting bond type - single down', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single Down-option',
      '[#6](-[#6])(-[#6])\\[#6]',
    );
  });

  test('Setting bond type - single up/down', async () => {
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1371 is fixed
     */
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single Up/Down-option',
      '[#6](-[#6])(-[#6])-[#6]',
    );
  });

  test('Setting bond type - double', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Double-option',
      '[#6](-[#6])(-[#6])=[#6]',
    );
  });

  test('Setting bond type - double cis/trans', async () => {
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1371 is fixed
     */
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Double Cis/Trans-option',
      '[#6](-[#6])(-[#6])=[#6]',
    );
  });

  test('Setting bond type - triple', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Triple-option',
      '[#6](-[#6])(-[#6])#[#6]',
    );
  });

  test('Setting bond type - aromatic', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Aromatic-option',
      '[#6](-[#6])(-[#6]):[#6]',
    );
  });

  test('Setting bond type - any', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Any-option',
      '[#6](-[#6])(-[#6])~[#6]',
    );
  });

  test('Setting bond type - hydrogen', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Hydrogen-option',
      '[#6](-[#6])(-[#6])[#6]',
    );
    await verifySMARTSExportWarnings(page);
  });

  test('Setting bond type - single/double', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single/Double-option',
      '[#6](-[#6])(-[#6])!:;-,=[#6]',
    );
  });

  test('Setting bond type - single/aromatic', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single/Aromatic-option',
      '[#6](-[#6])(-[#6])[#6]',
    );
  });

  test('Setting bond type - double/aromatic', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Double/Aromatic-option',
      '[#6](-[#6])(-[#6])=,:[#6]',
    );
  });

  test('Setting bond type - dative', async () => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Dative-option',
      '[#6](-[#6])(-[#6])[#6]',
    );
    await verifySMARTSExportWarnings(page);
  });

  // Tests for bond topology:

  test('Setting bond topology - ring', async () => {
    await setAndCheckBondProperties(
      page,
      setBondTopology,
      'Ring-option',
      '[#6](-[#6])(-[#6])-;@[#6]',
    );
  });

  test('Setting bond topology - chain', async () => {
    await setAndCheckBondProperties(
      page,
      setBondTopology,
      'Chain-option',
      '[#6](-[#6])(-[#6])-;!@[#6]',
    );
  });

  test('Setting reacting center', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3431
     * Description: setting reacting center option should have no impact on SMARTS output but warning should be displayed
     */
    await setAndCheckBondProperties(
      page,
      setReactingCenter,
      'Center-option',
      '[#6](-[#6])(-[#6])-[#6]',
    );
    await verifySMARTSExportWarnings(page);
  });

  // Custom query for bond

  test('Setting custom query - any OR double', async () => {
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1372 is fixed
     */
    await setAndCheckBondProperties(
      page,
      setCustomQueryForBond,
      '~,=',
      '[#6](-[#6])(-[#6])~,=[#6]',
    );
  });

  test('Setting custom query - directional bond "up or unspecified"', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/1281
     * Description: "or unspecified"("?") quantifier should be supported
     */
    await setAndCheckBondProperties(
      page,
      setCustomQueryForBond,
      '/?',
      '[#6](-[#6])(-[#6])/?[#6]',
    );
  });
});

test.describe('Checking converting bond attributes to custom query', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    const numberOfBond = 0;
    page = await initMoleculesCanvas();
    await drawStructureAndDoubleClickOnBond(page, numberOfBond);
  });
  test.afterEach(async () => {
    if (await BondPropertiesDialog(page).window.isVisible()) {
      await BondPropertiesDialog(page).cancel();
    }
  });

  test('Converting Topology = "Either" and Type = "Single" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3372
     * Description: If topology = "Either" then customQuery should be empty e.g. Type=Single, Topology=Either => customQuery=-
     */
    const expectedValue = '-';
    await setBondType(page, 'Single-option');
    await setBondTopology(page, 'Either-option');
    await setCustomQueryAndCheckValue(page, expectedValue);
    await takeEditorScreenshot(page);
  });

  test('Converting Topology = "Ring" and Type = "Double" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3372
     * Description: If topology = "Ring" then customQuery should be @, e.g. Type=Double, Topology=Ring=>customQuery==;@
     */
    const expectedValue = '=;@';
    await setBondType(page, 'Double-option');
    await setBondTopology(page, 'Ring-option');
    await setCustomQueryAndCheckValue(page, expectedValue);
  });

  test('Converting Topology = "Chain" and Type = "Triple" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3372
     * Description: If topology = "Chain" then customQuery should be !@, e.g. Type=Triple, Topology=Chain=>customQuery=#;!@
     */
    const expectedValue = '#;!@';
    await setBondType(page, 'Triple-option');
    await setBondTopology(page, 'Chain-option');
    await setCustomQueryAndCheckValue(page, expectedValue);
  });

  test('Converting Type = "Aromatic" and Reacting Center = "Center" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3328
     * Description: aromatic bond should be converted to custom query as: :
     * Reacting Center option should be ingored at custom query
     */
    const expectedValue = ':';
    await setBondType(page, 'Aromatic-option');
    await setReactingCenter(page, 'Center-option');
    await setCustomQueryAndCheckValue(page, expectedValue);
  });

  test('Converting Type = "Any" and Reacting Center = "Made/broken" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3328
     * Description: any bond should be converted to custom query as: ~
     * Reacting Center option should be ingored at custom query
     */
    const expectedValue = '~';
    await setBondType(page, 'Any-option');
    await setReactingCenter(page, 'Made/broken-option');
    await setCustomQueryAndCheckValue(page, expectedValue);
  });

  test('Converting Type = "Single up" and Reacting Center = "Order changes" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3328
     * Description: Single up bond should be converted to custom query as: /
     * Reacting Center option should be ingored at custom query
     */
    const expectedValue = '/';
    await setBondType(page, 'Single Up-option');
    await setReactingCenter(page, 'Order changes-option');
    await setCustomQueryAndCheckValue(page, expectedValue);
  });

  test('Converting Type = "Single down" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3328
     * Description: Single down bond should be converted to custom query as: \
     */
    const expectedValue = '\\';
    await setBondType(page, 'Single Down-option');
    await setCustomQueryAndCheckValue(page, expectedValue);
  });
});

test.describe('Checking saving attributes to .ket file', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    const numberOfBond = 0;
    page = await initMoleculesCanvas();
    await drawStructureAndDoubleClickOnBond(page, numberOfBond);
  });

  test('Save *.ket file with custom query for bond attribute', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3328
     * Description: In KET format customQuery should be saved into the bond object without other properties
     */
    await BondPropertiesDialog(page).setOptions({
      customQuery: '=;@',
    });

    await verifyFileExport(
      page,
      'KET/three-bond-structure-with-custom-query-to-compare.ket',
      FileType.KET,
    );
  });
});
