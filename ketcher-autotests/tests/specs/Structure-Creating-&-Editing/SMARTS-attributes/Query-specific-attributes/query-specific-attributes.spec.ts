/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page, test } from '@playwright/test';
import {
  doubleClickOnAtom,
  moveMouseAway,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
} from '@utils';
import { checkSmartsValue, checkSmartsWarnings } from '../utils';
import { drawStructure } from '@utils/canvas/drawStructures';
import {
  AtomPropertiesDialog,
  selectAromaticity,
  selectChirality,
  selectConnectivity,
  selectHCount,
  selectImplicitHCount,
  selectRingBondCount,
  selectRingMembership,
  selectRingSize,
  selectSubstitutionCount,
  selectUnsaturated,
} from '@tests/pages/molecules/canvas/AtomPropertiesDialog';

async function setAndCheckQuerySpecificProperties(
  page: Page,
  setProperty: (arg0: Page, arg1: string) => Promise<void>,
  value: string,
  expectedSmarts: string,
) {
  await setProperty(page, value);
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
  });

  test('Setting ring bond count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectRingBondCount,
      '2',
      '[#6](-[#6])(-[#6;x2])-[#6]',
    );
  });

  test('Setting ring bond count - As drawn', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectRingBondCount,
      'As drawn',
      '[#6](-[#6])(-[#6;x0])-[#6]',
    );
  });

  test('Setting H count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectHCount,
      '3',
      '[#6](-[#6])(-[#6;H3])-[#6]',
    );
  });

  test('Setting substitution count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectSubstitutionCount,
      '4',
      '[#6](-[#6])(-[#6;D4])-[#6]',
    );
  });

  test('Setting unsaturated', async ({ page }) => {
    await selectUnsaturated(page);
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
      selectAromaticity,
      'aromatic',
      '[#6](-[#6])(-c)-[#6]',
    );
  });

  test('Setting aromacity - aliphatic', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectAromaticity,
      'aliphatic',
      '[#6](-[#6])(-C)-[#6]',
    );
  });

  test('Setting implicit H count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectImplicitHCount,
      '5',
      '[#6](-[#6])(-[#6;h5])-[#6]',
    );
  });

  test('Setting ring membership', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectRingMembership,
      '6',
      '[#6](-[#6])(-[#6;R6])-[#6]',
    );
  });

  test('Setting ring size', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectRingSize,
      '7',
      '[#6](-[#6])(-[#6;r7])-[#6]',
    );
  });

  test('Setting connectivity', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectConnectivity,
      '8',
      '[#6](-[#6])(-[#6;X8])-[#6]',
    );
  });

  test('Setting chirality - anticlockwise', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectChirality,
      'anticlockwise',
      '[#6](-[#6])(-[#6;@])-[#6]',
    );
  });

  test('Setting chirality - clockwise', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      selectChirality,
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
    await AtomPropertiesDialog(page).expandQuerySpecific();
    await AtomPropertiesDialog(page).setImplicitHCount('5');
    await AtomPropertiesDialog(page).setAromaticity('aromatic');
    await AtomPropertiesDialog(page).setConnectivity('2');
    await AtomPropertiesDialog(page).pressApplyButton();
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, expectedSmarts);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test.describe('Checking converting attributes to custom query', () => {
    test.beforeEach(async ({ page }) => {
      const numberOfAtom = 0;
      await drawStructureAndDoubleClickOnAtom(page, 'C', numberOfAtom);
      await AtomPropertiesDialog(page).expandQuerySpecific();
    });

    test('Converting substitution count and ring bond count to custom query', async ({
      page,
    }) => {
      /**
       * Test case: https://github.com/epam/ketcher/issues/3445
       * Description: attributes should be converted to custom query in correct SMARTS annotation
       * (D<n> for substitution count and x<n> for ring bond count)
       */
      await AtomPropertiesDialog(page).setRingBondCount('5');
      await AtomPropertiesDialog(page).setSubstitutionCount('7');
      await AtomPropertiesDialog(page).checkCustomQuery();
      await takeEditorScreenshot(page);
    });

    test('Converting all query specific attributes to custom query', async ({
      page,
    }) => {
      /**
       * Test case: https://github.com/epam/ketcher/issues/3445
       * Description: all attributes should be converted to custom query correctly (according to table at https://github.com/epam/ketcher/issues/3459)
       */
      await AtomPropertiesDialog(page).setRingBondCount('As drawn');
      await AtomPropertiesDialog(page).setHCount('0');
      await AtomPropertiesDialog(page).setSubstitutionCount('1');
      await AtomPropertiesDialog(page).checkUnsaturated();
      await AtomPropertiesDialog(page).setAromaticity('aliphatic');
      await AtomPropertiesDialog(page).setImplicitHCount('2');
      await AtomPropertiesDialog(page).setRingMembership('3');
      await AtomPropertiesDialog(page).setRingSize('4');
      await AtomPropertiesDialog(page).setConnectivity('5');
      await AtomPropertiesDialog(page).setChirality('clockwise');
      await AtomPropertiesDialog(page).checkCustomQuery();
      await takeEditorScreenshot(page);
    });
  });
});
