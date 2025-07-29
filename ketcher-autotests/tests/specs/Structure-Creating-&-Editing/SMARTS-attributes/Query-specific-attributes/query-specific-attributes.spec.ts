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
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import {
  Aromaticity,
  AtomPropertiesSettings,
  Chirality,
  Connectivity,
  HCount,
  ImplicitHCount,
  RingBondCount,
  RingMembership,
  RingSize,
  SubstitutionCount,
} from '@tests/pages/constants/atomProperties/Constants';

async function setAndCheckQuerySpecificProperties(
  page: Page,
  options: AtomPropertiesSettings,
  expectedSmarts: string,
) {
  await AtomPropertiesDialog(page).setOptions(options);
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
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.Two },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;x2])-[#6]');
  });

  test('Setting ring bond count - As drawn', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingBondCount: RingBondCount.As_Drawn },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;x0])-[#6]');
  });

  test('Setting H count', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { HCount: HCount.Three },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;H3])-[#6]');
  });

  test('Setting substitution count', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { SubstitutionCount: SubstitutionCount.Four },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;D4])-[#6]');
  });

  test('Setting unsaturated', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        UnsaturatedCheckbox: true,
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      '[#6](-[#6])(-[#6;$([*,#1]=,#,:[*,#1])])-[#6]',
    );
    await checkSmartsWarnings(page);
  });

  test('Setting aromacity - aromatic', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { Aromaticity: Aromaticity.Aromatic },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-c)-[#6]');
  });

  test('Setting aromacity - aliphatic', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { Aromaticity: Aromaticity.Aliphatic },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-C)-[#6]');
  });

  test('Setting implicit H count', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { ImplicitHCount: ImplicitHCount.Five },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;h5])-[#6]');
  });

  test('Setting ring membership', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingMembership: RingMembership.Six },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;R6])-[#6]');
  });

  test('Setting ring size', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { RingSize: RingSize.Seven },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;r7])-[#6]');
  });

  test('Setting connectivity', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { Connectivity: Connectivity.Eight },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;X8])-[#6]');
  });

  test('Setting chirality - anticlockwise', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { Chirality: Chirality.Anticlockwise },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;@])-[#6]');
  });

  test('Setting chirality - clockwise', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: { Chirality: Chirality.Clockwise },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;@@])-[#6]');
  });

  test('Setting implicit H count, aromacity and connectivity', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/1321
     * Description: saving SMARTS with implicit H count and any other attribute should not cause any error
     */
    const expectedSmarts = '[#6](-[#6])(-[c;h5;X2])-[#6]';
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        ImplicitHCount: ImplicitHCount.Five,
        Aromaticity: Aromaticity.Aromatic,
        Connectivity: Connectivity.Two,
      },
    });
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
      await AtomPropertiesDialog(page).selectRingBondCount(RingBondCount.Five);
      await AtomPropertiesDialog(page).selectSubstitutionCount(
        SubstitutionCount.Seven,
      );
      await AtomPropertiesDialog(page).setCustomQueryCheckbox(true);
      await takeEditorScreenshot(page);
    });

    test('Converting all query specific attributes to custom query', async ({
      page,
    }) => {
      /**
       * Test case: https://github.com/epam/ketcher/issues/3445
       * Description: all attributes should be converted to custom query correctly (according to table at https://github.com/epam/ketcher/issues/3459)
       */
      await AtomPropertiesDialog(page).selectRingBondCount(
        RingBondCount.As_Drawn,
      );
      await AtomPropertiesDialog(page).selectHCount(HCount.Zero);
      await AtomPropertiesDialog(page).selectSubstitutionCount(
        SubstitutionCount.One,
      );
      await AtomPropertiesDialog(page).setUnsaturatedCheckbox(true);
      await AtomPropertiesDialog(page).selectAromaticity(Aromaticity.Aliphatic);
      await AtomPropertiesDialog(page).selectImplicitHCount(ImplicitHCount.Two);
      await AtomPropertiesDialog(page).selectRingMembership(
        RingMembership.Three,
      );
      await AtomPropertiesDialog(page).selectRingSize(RingSize.Four);
      await AtomPropertiesDialog(page).selectConnectivity(Connectivity.Five);
      await AtomPropertiesDialog(page).selectChirality(Chirality.Clockwise);
      await AtomPropertiesDialog(page).setCustomQueryCheckbox(true);
      await takeEditorScreenshot(page);
    });
  });
});
