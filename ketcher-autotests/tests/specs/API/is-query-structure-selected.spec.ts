import { Page, expect, test } from '@fixtures';
import { doubleClickOnAtom, waitForPageInit } from '@utils';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { selectAllStructuresOnCanvas } from '@tests/utils/canvas';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import { TypeOption } from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import {
  Aromaticity,
  SubstitutionCount,
} from '@tests/pages/constants/atomProperties/Constants';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { BondPropertiesDialog } from '@tests/pages/molecules/canvas/BondPropertiesDialog';
import { BondTypeOption } from '@tests/pages/constants/bondProperties/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

async function isQueryStructureSelected(page: Page): Promise<boolean> {
  return await page.evaluate(() => window.ketcher.isQueryStructureSelected());
}

async function checkIsQueryStructureSelected(
  page: Page,
  isQueryStructureSelectedValue: boolean,
) {
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
    await expect(AtomPropertiesDialog(page).window).toBeVisible();
  });

  test('returns true, when atom has custom query', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      CustomQuery: {
        CustomQueryCheckbox: true,
        CustomQueryTextArea: '#6;x9',
      },
    });
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when atom has substitution count', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        SubstitutionCount: SubstitutionCount.Four,
      },
    });
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when atom is unsaturated', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        UnsaturatedCheckbox: true,
      },
    });
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when atom is aromatic', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        Aromaticity: Aromaticity.Aromatic,
      },
    });
    await checkIsQueryStructureSelected(page, true);
  });

  test('returns true, when structure has "Any" atom', async ({ page }) => {
    await AtomPropertiesDialog(page).cancel();
    await RightToolbar(page).anyAtom();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });
    await selectAllStructuresOnCanvas(page);
    expect(await isQueryStructureSelected(page)).toBe(true);
  });
});

test.describe('API isQueryStructureSelected for bonds', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await drawBenzeneRing(page);
    await page.keyboard.press('Escape');
    await getBondLocator(page, { bondId: 9 }).dblclick({ force: true });
    await expect(BondPropertiesDialog(page).window).toBeVisible();
  });

  const queryBonds: [string, BondTypeOption][] = [
    ['Any', BondTypeOption.Any],
    ['Single/Double', BondTypeOption.SingleDouble],
    ['Single/Aromatic', BondTypeOption.SingleAromatic],
    ['Double/Aromatic', BondTypeOption.DoubleAromatic],
    ['Aromatic', BondTypeOption.Aromatic],
    ['Single/UpDown', BondTypeOption.SingleUpDown],
  ];

  for (const queryBond of queryBonds) {
    test(`returns true for ${queryBond[0]} bond`, async ({ page }) => {
      await BondPropertiesDialog(page).setOptions({
        type: queryBond[1],
      });
      await checkIsQueryStructureSelected(page, true);
    });
  }

  test(`returns true for customQuery bond`, async ({ page }) => {
    await BondPropertiesDialog(page).setOptions({
      customQuery: 'x2&D3,D2',
    });
    await checkIsQueryStructureSelected(page, true);
  });
});

test.describe('Tests for API isQueryStructureSelected for Custom Component', () => {
  test('returns true for custom component', async ({ page }) => {
    await waitForPageInit(page);
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.QueryComponent,
    });
    await selectAllStructuresOnCanvas(page);
    expect(await isQueryStructureSelected(page)).toBe(true);
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
