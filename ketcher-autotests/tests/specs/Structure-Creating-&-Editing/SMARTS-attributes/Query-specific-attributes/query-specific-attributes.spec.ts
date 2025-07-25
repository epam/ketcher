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
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { RingBondCount: RingBondCount.Two } },
      '[#6](-[#6])(-[#6;x2])-[#6]',
    );
  });

  test('Setting ring bond count - As drawn', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { RingBondCount: RingBondCount.As_Drawn } },
      '[#6](-[#6])(-[#6;x0])-[#6]',
    );
  });

  test('Setting H count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { HCount: HCount.Three } },
      '[#6](-[#6])(-[#6;H3])-[#6]',
    );
  });

  test('Setting substitution count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      {
        QuerySpecificProperties: { SubstitutionCount: SubstitutionCount.Four },
      },
      '[#6](-[#6])(-[#6;D4])-[#6]',
    );
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
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { Aromaticity: Aromaticity.Aromatic } },
      '[#6](-[#6])(-c)-[#6]',
    );
  });

  test('Setting aromacity - aliphatic', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { Aromaticity: Aromaticity.Aliphatic } },
      '[#6](-[#6])(-C)-[#6]',
    );
  });

  test('Setting implicit H count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { ImplicitHCount: ImplicitHCount.Five } },
      '[#6](-[#6])(-[#6;h5])-[#6]',
    );
  });

  test('Setting ring membership', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { RingMembership: RingMembership.Six } },
      '[#6](-[#6])(-[#6;R6])-[#6]',
    );
  });

  test('Setting ring size', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { RingSize: RingSize.Seven } },
      '[#6](-[#6])(-[#6;r7])-[#6]',
    );
  });

  test('Setting connectivity', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { Connectivity: Connectivity.Eight } },
      '[#6](-[#6])(-[#6;X8])-[#6]',
    );
  });

  test('Setting chirality - anticlockwise', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { Chirality: Chirality.Anticlockwise } },
      '[#6](-[#6])(-[#6;@])-[#6]',
    );
  });

  test('Setting chirality - clockwise', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      { QuerySpecificProperties: { Chirality: Chirality.Clockwise } },
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
      await AtomPropertiesDialog(page).setRingBondCount(RingBondCount.Five);
      await AtomPropertiesDialog(page).setSubstitutionCount(
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
      await AtomPropertiesDialog(page).setRingBondCount(RingBondCount.As_Drawn);
      await AtomPropertiesDialog(page).setHCount(HCount.Zero);
      await AtomPropertiesDialog(page).setSubstitutionCount(
        SubstitutionCount.One,
      );
      await AtomPropertiesDialog(page).setUnsaturated(true);
      await AtomPropertiesDialog(page).setAromaticity(Aromaticity.Aliphatic);
      await AtomPropertiesDialog(page).setImplicitHCount(ImplicitHCount.Two);
      await AtomPropertiesDialog(page).setRingMembership(RingMembership.Three);
      await AtomPropertiesDialog(page).setRingSize(RingSize.Four);
      await AtomPropertiesDialog(page).setConnectivity(Connectivity.Five);
      await AtomPropertiesDialog(page).setChirality(Chirality.Clockwise);
      await AtomPropertiesDialog(page).setCustomQueryCheckbox(true);
      await takeEditorScreenshot(page);
    });
  });
});
