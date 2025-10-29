import { Page, test, expect } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { verifySMARTSExport, verifySMARTSExportWarnings } from '../utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { BondPropertiesDialog } from '@tests/pages/molecules/canvas/BondPropertiesDialog';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import {
  BondReactingCenterOption,
  BondTopologyOption,
  BondTypeOption,
} from '@tests/pages/constants/bondProperties/Constants';

async function drawStructure(page: Page) {
  await waitForPageInit(page);
  await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await page.keyboard.press('Escape');
}

test.describe('Checking bond attributes in SMARTS format', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {
    await drawStructure(page);
    await getBondLocator(page, { bondId: 0 }).dblclick({ force: true });
    await expect(BondPropertiesDialog(page).window).toBeVisible();
  });

  // Tests for bond type:

  test('Setting bond type - single (aliphatic))', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Single,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])-[#6]');
  });

  test('Setting bond type - single up', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.SingleUp,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])/[#6]');
  });

  test('Setting bond type - single down', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.SingleDown,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])\\[#6]');
  });

  test('Setting bond type - single up/down', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.SingleUpDown,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])-[#6]');
  });

  test('Setting bond type - double', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Double,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])=[#6]');
  });

  test('Setting bond type - double cis/trans', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.DoubleCisTrans,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])=[#6]');
  });

  test('Setting bond type - triple', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Triple,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])#[#6]');
  });

  test('Setting bond type - aromatic', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Aromatic,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6]):[#6]');
  });

  test('Setting bond type - any', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Any,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])~[#6]');
  });

  test('Setting bond type - hydrogen', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Hydrogen,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])[#6]');
    await verifySMARTSExportWarnings(page);
  });

  test('Setting bond type - single/double', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.SingleDouble,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])!:;-,=[#6]');
  });

  test('Setting bond type - single/aromatic', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.SingleAromatic,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])[#6]');
  });

  test('Setting bond type - double/aromatic', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.DoubleAromatic,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])=,:[#6]');
  });

  test('Setting bond type - dative', async () => {
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Dative,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])[#6]');
    await verifySMARTSExportWarnings(page);
  });

  // Tests for bond topology:

  test('Setting bond topology - ring', async () => {
    await BondPropertiesDialog(page).setOptions({
      topology: BondTopologyOption.Ring,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])-;@[#6]');
  });

  test('Setting bond topology - chain', async () => {
    await BondPropertiesDialog(page).setOptions({
      topology: BondTopologyOption.Chain,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])-;!@[#6]');
  });

  test('Setting reacting center', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3431
     * Description: setting reacting center option should have no impact on SMARTS output but warning should be displayed
     */
    await BondPropertiesDialog(page).setOptions({
      reactingCenter: BondReactingCenterOption.Center,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])-[#6]');
    await verifySMARTSExportWarnings(page);
  });

  // Custom query for bond

  test('Setting custom query - any OR double', async () => {
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1372 is fixed
     */
    await BondPropertiesDialog(page).setOptions({
      customQuery: '~,=',
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])~,=[#6]');
  });

  test('Setting custom query - directional bond "up or unspecified"', async () => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/1281
     * Description: "or unspecified"("?") quantifier should be supported
     */
    await BondPropertiesDialog(page).setOptions({
      customQuery: '/?',
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6](-[#6])(-[#6])/?[#6]');
  });
});

test.describe('Checking converting bond attributes to custom query', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {
    await drawStructure(page);
    await getBondLocator(page, { bondId: 0 }).dblclick({ force: true });
    await expect(BondPropertiesDialog(page).window).toBeVisible();
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
    await BondPropertiesDialog(page).selectBondType(BondTypeOption.Single);
    await BondPropertiesDialog(page).selectBondTopology(
      BondTopologyOption.Either,
    );
    await BondPropertiesDialog(page).checkCustomQueryCheckbox();
    expect(await BondPropertiesDialog(page).getCustomQueryText()).toEqual(
      expectedValue,
    );
    await takeEditorScreenshot(page);
  });

  test('Converting Topology = "Ring" and Type = "Double" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3372
     * Description: If topology = "Ring" then customQuery should be @, e.g. Type=Double, Topology=Ring=>customQuery==;@
     */
    const expectedValue = '=;@';
    await BondPropertiesDialog(page).selectBondType(BondTypeOption.Double);
    await BondPropertiesDialog(page).selectBondTopology(
      BondTopologyOption.Ring,
    );
    await BondPropertiesDialog(page).checkCustomQueryCheckbox();
    expect(await BondPropertiesDialog(page).getCustomQueryText()).toEqual(
      expectedValue,
    );
  });

  test('Converting Topology = "Chain" and Type = "Triple" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3372
     * Description: If topology = "Chain" then customQuery should be !@, e.g. Type=Triple, Topology=Chain=>customQuery=#;!@
     */
    const expectedValue = '#;!@';
    await BondPropertiesDialog(page).selectBondType(BondTypeOption.Triple);
    await BondPropertiesDialog(page).selectBondTopology(
      BondTopologyOption.Chain,
    );
    await BondPropertiesDialog(page).checkCustomQueryCheckbox();
    expect(await BondPropertiesDialog(page).getCustomQueryText()).toEqual(
      expectedValue,
    );
  });

  test('Converting Type = "Aromatic" and Reacting Center = "Center" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3328
     * Description: aromatic bond should be converted to custom query as: :
     * Reacting Center option should be ingored at custom query
     */
    const expectedValue = ':';
    await BondPropertiesDialog(page).selectBondType(BondTypeOption.Aromatic);
    await BondPropertiesDialog(page).selectBondReactingCenter(
      BondReactingCenterOption.Center,
    );
    await BondPropertiesDialog(page).checkCustomQueryCheckbox();
    expect(await BondPropertiesDialog(page).getCustomQueryText()).toEqual(
      expectedValue,
    );
  });

  test('Converting Type = "Any" and Reacting Center = "Made/broken" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3328
     * Description: any bond should be converted to custom query as: ~
     * Reacting Center option should be ingored at custom query
     */
    const expectedValue = '~';
    await BondPropertiesDialog(page).selectBondType(BondTypeOption.Any);
    await BondPropertiesDialog(page).selectBondReactingCenter(
      BondReactingCenterOption.MadeBroken,
    );
    await BondPropertiesDialog(page).checkCustomQueryCheckbox();
    expect(await BondPropertiesDialog(page).getCustomQueryText()).toEqual(
      expectedValue,
    );
  });

  test('Converting Type = "Single up" and Reacting Center = "Order changes" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3328
     * Description: Single up bond should be converted to custom query as: /
     * Reacting Center option should be ingored at custom query
     */
    const expectedValue = '/';
    await BondPropertiesDialog(page).selectBondType(BondTypeOption.SingleUp);
    await BondPropertiesDialog(page).selectBondReactingCenter(
      BondReactingCenterOption.OrderChanges,
    );
    await BondPropertiesDialog(page).checkCustomQueryCheckbox();
    expect(await BondPropertiesDialog(page).getCustomQueryText()).toEqual(
      expectedValue,
    );
  });

  test('Converting Type = "Single down" to custom query', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3328
     * Description: Single down bond should be converted to custom query as: \
     */
    const expectedValue = '\\';
    await BondPropertiesDialog(page).selectBondType(BondTypeOption.SingleDown);
    await BondPropertiesDialog(page).checkCustomQueryCheckbox();
    expect(await BondPropertiesDialog(page).getCustomQueryText()).toEqual(
      expectedValue,
    );
  });
});

test.describe('Checking saving attributes to .ket file', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
    await drawStructure(page);
    await getBondLocator(page, { bondId: 0 }).dblclick({ force: true });
    await expect(BondPropertiesDialog(page).window).toBeVisible();
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
