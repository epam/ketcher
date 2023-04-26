import { expect, test } from '@playwright/test';
import {
  buttonLocator,
  openFile,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  delay,
  receiveMolFileComparisonData,
} from '@utils';

test('Open and Save files - Open/Save structure with atom properties 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1855(1)
   * Description: Sctucrute with atom properties is opened and saved correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('mol_1855_to_open.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save files - Open/Save structure with atom properties 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1855(2)
   * Description: Sctucrute with atom properties is opened and saved correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('mol_1855_to_open.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);

  const METADATA_STRING_INDEX = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1855_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save V3000 file with atom and bond properties 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1857(1)
   * Description: Strucrute with atom and bond properties is opened and saved correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Marvin_Atom_properties_V3000.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(8);
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save V3000 file with atom and bond properties 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1857(2)
   * Description: Strucrute with atom and bond properties is opened and saved correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Marvin_Atom_properties_V3000.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(6);
  await clickInTheMiddleOfTheScreen(page);

  const METADATA_STRING_INDEX = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1857_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save Markush files 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1894(1)
   * Description: Markush structure is displayed as an RGroup structure.
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Markush.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save Markush files 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1894(2)
   * Description: Markush structure is displayed as an RGroup structure.
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Markush.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);

  const METADATA_STRINGS_INDEXES = [0, 4];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRINGS_INDEXES,
    'tests/test-data/mol_1894_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save V2000 *.mol file contains abbreviation 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1858(1)
   * Description: v2000 mol file with abbreviation is opened and saved correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('sec_butyl_abr.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save V2000 *.mol file contains abbreviation 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1858(2)
   * Description: v2000 mol file with abbreviation is opened and saved correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('sec_butyl_abr.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);

  const METADATA_STRING_INDEX = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1858_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save V3000 *.mol file contains abbreviation 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1859(1)
   * Description: v3000 mol file with abbreviation is opened and saved correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('sec_butyl_abr_V3000.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await delay(6);
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save V3000 *.mol file contains abbreviation 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1859(2)
   * Description: v3000 mol file with abbreviation is opened and saved correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('sec_butyl_abr_V3000.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(6);
  await clickInTheMiddleOfTheScreen(page);
  const METADATA_STRING_INDEX = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1859_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save file with R-Groups 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1873(1)
   * Description: Structure with R-Groups is correctly opened from Mol file
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Rgroup.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save file with R-Groups 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1873(2)
   * Description: Structure with R-Groups is correctly saved to Mol file
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Rgroup.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  const METADATA_STRINGS_INDEXES = [0, 4];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRINGS_INDEXES,
    'tests/test-data/mol_1873_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save file contains Heteroatoms 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1878(1)
   * Description: Structure with heteroatoms is opened from mol file correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Heteroatoms.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save file contains Heteroatoms 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1878(2)
   * Description: Structure with heteroatoms is saved to mol file correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Heteroatoms.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  const METADATA_STRING_INDEX = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1878_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save V3000 mol file contains attached data 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1882(1)
   * Description: Structure with attached data is opened from mol file correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Attached data_V3000.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await delay(8);
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save V3000 mol file contains attached data 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1882(2)
   * Description: Structure with attached data is saved to mol file correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Attached data_V3000.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(6);
  await clickInTheMiddleOfTheScreen(page);
  const METADATA_STRING_INDEX = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1882_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - V3000 *.mol file contains Heteroatoms 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1879(1)
   * Description: Structure with heteroatoms is opened from mol v3000 file correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Heteroatoms_V3000.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await delay(8);
  await takeEditorScreenshot(page);
});

test('Open and Save file - V3000 *.mol file contains Heteroatoms 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1879(2)
   * Description: Structure with heteroatoms is saved correctly to mol file
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Heteroatoms_V3000.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(6);
  await clickInTheMiddleOfTheScreen(page);
  const METADATA_STRING_INDEX = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1879_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save file with Attached data 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1880(1)
   * Description: Structure with heteroatoms is opened from mol v3000 file correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Attached data.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save file with Attached data 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1880(2)
   * Description: Structure with heteroatoms is saved correctly to mol file
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Attached data.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  const METADATA_STRING_INDEX = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1880_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save file contains abs stereochemistry 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1883(1)
   * Description: File with abs stereochemistry is opened correctly from mol file
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('V2000_abs.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save file contains abs stereochemistry 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1883(2)
   * Description: Structure with abs stereochemistry is saved correctly to mol file
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('V2000_abs.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  const METADATA_STRING_INDEX = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1883_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save V3000 mol file contains abs stereochemistry 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1884(1)
   * Description: File with abs stereochemistry is opened correctly from mol v3000 file
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('V3000_abs.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(7);
  await clickInTheMiddleOfTheScreen(page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save V3000 mol file contains abs stereochemistry 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1884(2)
   * Description: Structure with abs stereochemistry is saved correctly to mol file
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('V3000_abs.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(7);
  await clickInTheMiddleOfTheScreen(page);
  const METADATA_STRING_INDEX = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1884_to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Save V2000 molfile as V3000 molfile', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1985
   * Description: Structure opened from V2000 molfile can be saved to V3000 molfile
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('spiro.mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await clickInTheMiddleOfTheScreen(page);
  const METADATA_STRINGS_INDEXES = [1, 3];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRINGS_INDEXES,
    'tests/test-data/mol_1885_to_compare.mol',
    'v3000'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Save V3000 molfile as V2000 molfile', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1986
   * Description: Structure opened from V3000 molfile can be saved to V2000 molfile
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('ketcher (4).mol', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(7);
  await clickInTheMiddleOfTheScreen(page);
  const METADATA_STRINGS_INDEXES = [1];
  const { molFileExpected, molFile } = await receiveMolFileComparisonData(
    page,
    METADATA_STRINGS_INDEXES,
    'tests/test-data/mol_1886_to_compare.mol',
    'v2000'
  );

  expect(molFile).toEqual(molFileExpected);
});
