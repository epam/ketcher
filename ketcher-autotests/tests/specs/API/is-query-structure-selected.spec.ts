import { Page, expect, test } from '@playwright/test';
import {
  BondType,
  BondTypeName,
  LeftPanelButton,
  clickOnAtom,
  doubleClickOnAtom,
  doubleClickOnBond,
  drawBenzeneRing,
  pressButton,
  selectAllStructuresOnCanvas,
  selectTool,
  setAromaticity,
  setBondType,
  setCustomQuery,
  setSubstitutionCount,
  setUnsaturated,
  waitForAtomPropsModal,
  waitForBondPropsModal,
  waitForPageInit,
} from '@utils';

async function isQueryStructureSelected(page: Page): Promise<boolean> {
  return await page.evaluate(() => window.ketcher.isQueryStructureSelected());
}

async function checkIsQueryStructureSelected(
  page: Page,
  isQueryStructureSelectedValue: boolean,
) {
  await pressButton(page, 'Apply');
  await selectAllStructuresOnCanvas(page);
  expect(await isQueryStructureSelected(page)).toBe(
    isQueryStructureSelectedValue,
  );
}

test.describe('API isQueryStructureSelected for atoms', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    const anyAtom = 0;
    await drawBenzeneRing(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', anyAtom);
    await waitForAtomPropsModal(page);
    await page.getByTestId('Query specific-section').click();
  });

  test('returns true, when atom has custom query', async ({ page }) => {
    const customQuery = '#6;x9';
    await setCustomQuery(page, customQuery);
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when atom has substitution count', async ({ page }) => {
    await setSubstitutionCount(page, '4');
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when atom is unsaturated', async ({ page }) => {
    await setUnsaturated(page);
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when atom is aromatic', async ({ page }) => {
    await setAromaticity(page, 'aromatic');
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when structure has "Any" atom', async ({ page }) => {
    await pressButton(page, 'Cancel');
    await page.getByTestId('any-atom').click();
    await clickOnAtom(page, 'C', 0);
    await selectAllStructuresOnCanvas(page);
    expect(await isQueryStructureSelected(page)).toBe(true);
  });
});

test.describe('API isQueryStructureSelected for bonds', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    const anyBond = 0;
    await drawBenzeneRing(page);
    await page.keyboard.press('Escape');
    await doubleClickOnBond(page, BondType.SINGLE, anyBond);
    await waitForBondPropsModal(page);
  });

  const queryBonds = [
    BondTypeName.Any,
    BondTypeName.SingleDouble,
    BondTypeName.SingleAromatic,
    BondTypeName.DoubleAromatic,
    BondTypeName.Aromatic,
    BondTypeName.SingleUpDown,
  ];

  for (const queryBond of queryBonds) {
    test(`returns true for ${queryBond} bond`, async ({ page }) => {
      await setBondType(page, queryBond);
      await checkIsQueryStructureSelected(page, true);
    });
  }

  test(`returns true for customQuery bond`, async ({ page }) => {
    const customQuery = 'x2&D3,D2';
    await setCustomQuery(page, customQuery);
    await checkIsQueryStructureSelected(page, true);
  });
});

test.describe('Tests for API isQueryStructureSelected for Custom Component', () => {
  test('returns true for custom component', async ({ page }) => {
    await waitForPageInit(page);
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    await selectTool(LeftPanelButton.S_Group, page);
    await page.getByTestId('s-group-type-input-span').click();
    await page.getByRole('option', { name: 'Query component' }).click();
    await checkIsQueryStructureSelected(page, true);
  });
});

test.describe('Tests for API isQueryStructureSelected without query features', () => {
  test("Benzene ring doesn't have query structures", async ({ page }) => {
    await waitForPageInit(page);
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    expect(await isQueryStructureSelected(page)).toBe(false);
  });
});
