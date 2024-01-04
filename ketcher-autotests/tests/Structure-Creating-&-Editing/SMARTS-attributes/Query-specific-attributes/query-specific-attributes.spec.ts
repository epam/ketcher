import { Page, test } from '@playwright/test';
import {
  doubleClickOnAtom,
  pressButton,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
} from '@utils';
import {
  checkSmartsValue,
  checkSmartsWarnings,
  setAromaticity,
  setChirality,
  setConnectivity,
  setHCount,
  setImplicitHCount,
  setRingBondCount,
  setRingMembership,
  setRingSize,
  setSubstitutionCount,
  setUnsaturated,
} from '../utils';
import { drawStructure } from '@utils/canvas/drawStructures';

const defaultFileFormat = 'MDL Molfile V2000';

async function setAndCheckQuerySpecificProperties(
  page: Page,
  setProperty: (arg0: Page, arg1: any) => Promise<void>,
  value: string,
  expectedSmarts: string,
) {
  await setProperty(page, value);
  await pressButton(page, 'Apply');
  await takeEditorScreenshot(page);
  await checkSmartsValue(page, expectedSmarts);
}

async function drawStructureAndDoubleClickOnAtom(
  page: Page,
  atomType: string,
  numberOfAtom: number,
) {
  await waitForPageInit(page);
  await drawStructure(page);
  await page.keyboard.press('Escape');
  await doubleClickOnAtom(page, atomType, numberOfAtom);
  await waitForAtomPropsModal(page);
}

test.describe('Checking query specific attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    await drawStructureAndDoubleClickOnAtom(page, 'C', numberOfAtom);
    await page.getByTestId('Query specific-section').click();
  });

  test('Setting ring bond count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setRingBondCount,
      '2',
      '[#6](-[#6])(-[#6;x2])-[#6]',
    );
  });

  test('Setting ring bond count - As drawn', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setRingBondCount,
      'As drawn',
      '[#6](-[#6])(-[#6;x0])-[#6]',
    );
  });

  test('Setting H count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setHCount,
      '3',
      '[#6](-[#6])(-[#6;H3])-[#6]',
    );
  });

  test('Setting substitution count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setSubstitutionCount,
      '4',
      '[#6](-[#6])(-[#6;D4])-[#6]',
    );
  });

  test('Setting unsaturated', async ({ page }) => {
    await setUnsaturated(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      '[#6](-[#6])(-[#6;$([*,#1]=,#,:[*,#1])])-[#6]',
    );
    await checkSmartsWarnings(page);
  });

  test('Setting aromacity - aromatic', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setAromaticity,
      'aromatic',
      '[#6](-[#6])(-[c])-[#6]',
    );
  });

  test('Setting aromacity - aliphatic', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setAromaticity,
      'aliphatic',
      '[#6](-[#6])(-[C])-[#6]',
    );
  });

  test('Setting implicit H count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setImplicitHCount,
      '5',
      '[#6](-[#6])(-[#6;h5])-[#6]',
    );
  });

  test('Setting ring membership', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setRingMembership,
      '6',
      '[#6](-[#6])(-[#6;R6])-[#6]',
    );
  });

  test('Setting ring size', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setRingSize,
      '7',
      '[#6](-[#6])(-[#6;r7])-[#6]',
    );
  });

  test('Setting connectivity', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setConnectivity,
      '8',
      '[#6](-[#6])(-[#6;X8])-[#6]',
    );
  });

  test('Setting chirality - anticlockwise', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setChirality,
      'anticlockwise',
      '[#6](-[#6])(-[#6;@])-[#6]',
    );
  });

  test('Setting chirality - clockwise', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setChirality,
      'clockwise',
      '[#6](-[#6])(-[#6;@@])-[#6]',
    );
  });

  test('Setting implicit H count, aromacity and connectivity', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/1321
     * Description: saving SMARTS with implicit H count and any other attribute should not cause any error
     */
    const expectedSmarts = '[#6](-[#6])(-[c;h5;X2])-[#6]';
    await setImplicitHCount(page, '5');
    await setAromaticity(page, 'aromatic');
    await setConnectivity(page, '2');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, expectedSmarts);
    await takeEditorScreenshot(page);
  });

  test.describe('Checking converting attributes to custom query', () => {
    test.beforeEach(async ({ page }) => {
      const numberOfAtom = 0;
      await drawStructureAndDoubleClickOnAtom(page, 'C', numberOfAtom);
      await page.getByTestId('Query specific-section').click();
    });

    test('Converting substitution count and ring bond count to custom query', async ({
      page,
    }) => {
      /**
       * Test case: https://github.com/epam/ketcher/issues/3445
       * Description: attributes should be converted to custom query in correct SMARTS annotation
       * (D<n> for substitution count and x<n> for ring bond count)
       */
      await setRingBondCount(page, '5');
      await setSubstitutionCount(page, '7');
      await page.getByTestId('custom-query-checkbox').check();
      await takeEditorScreenshot(page);
    });

    test('Converting all query specific attributes to custom query', async ({
      page,
    }) => {
      /**
       * Test case: https://github.com/epam/ketcher/issues/3445
       * Description: all attributes should be converted to custom query correctly (according to table at https://github.com/epam/ketcher/issues/3459)
       */
      await setRingBondCount(page, 'As drawn');
      await setHCount(page, '0');
      await setSubstitutionCount(page, '1');
      await setUnsaturated(page);
      await setAromaticity(page, 'aliphatic');
      await setImplicitHCount(page, '2');
      await setRingMembership(page, '3');
      await setRingSize(page, '4');
      await setConnectivity(page, '5');
      await setChirality(page, 'clockwise');
      await page.getByTestId('custom-query-checkbox').check();
      await takeEditorScreenshot(page);
    });
  });
});
