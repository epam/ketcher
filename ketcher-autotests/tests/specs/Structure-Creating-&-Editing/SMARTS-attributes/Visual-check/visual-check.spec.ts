import { test, expect } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  doubleClickOnAtom,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { selectElementFromPeriodicTable } from '@tests/pages/molecules/canvas/PeriodicTableDialog';
import { PeriodicTableElement } from '@tests/pages/constants/periodicTableDialog/Constants';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import {
  Aromaticity,
  AtomType,
  Chirality,
  Connectivity,
  HCount,
  ImplicitHCount,
  RingBondCount,
  RingMembership,
  RingSize,
  SubstitutionCount,
  Valence,
} from '@tests/pages/constants/atomProperties/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';

test.describe('Checking if displaying atom attributes does not broke integrity of the structure', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 3;
    await waitForPageInit(page);
    await BottomToolbar(page).cyclooctane();
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
    await expect(AtomPropertiesDialog(page).window).toBeVisible();
  });

  test('Setting all query specific attributes', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3424
    Description: checking if displaying all query specific attributes near to the lower left atom doesn't broke integrity of the structure
    This test is related to current bug: https://github.com/epam/ketcher/issues/3508
    */
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        RingBondCount: RingBondCount.Two,
        HCount: HCount.Three,
        SubstitutionCount: SubstitutionCount.Four,
        UnsaturatedCheckbox: true,
        Aromaticity: Aromaticity.Aliphatic,
        ImplicitHCount: ImplicitHCount.Five,
        RingMembership: RingMembership.Six,
        RingSize: RingSize.Seven,
        Connectivity: Connectivity.Eight,
        Chirality: Chirality.Clockwise,
      },
    });
    await takeEditorScreenshot(page);
  });

  test('Setting general atom attributes', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3508
    Description: checking if displaying few general atom attributes near to the lower left atom doesn't broke integrity of the structure
    This test is related to current bug: https://github.com/epam/ketcher/issues/3508
    */
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: {
        Charge: '-8',
        Isotope: '35',
        Valence: Valence.Eight,
      },
    });
    await takeEditorScreenshot(page);
  });

  test('Setting list of atoms', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3508
    Description: checking if displaying list of atoms near to the lower left atom doesn't broke integrity of the structure
    This test is related to current bug: https://github.com/epam/ketcher/issues/3508
    */
    const atomLabels = [
      PeriodicTableElement.Na,
      PeriodicTableElement.K,
      PeriodicTableElement.B,
      PeriodicTableElement.Er,
      PeriodicTableElement.Se,
    ];
    await AtomPropertiesDialog(page).selectAtomType(AtomType.List);
    await AtomPropertiesDialog(page).selectAtomsList({ AtomsList: atomLabels });
    await AtomPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
  });
});

test.describe('Checking if preview of attributes is displayed correctly after hover', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    await waitForPageInit(page);
    await CommonLeftToolbar(page).bondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
  });

  test('Checking preview of general atom and query specific attributes', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3327
    Description: when label has more than 3 characters then it should be truncated and pop-up text box should be shown on mouse hover
    */

    const point = await getAtomLocator(page, { atomLabel: 'C' })
      .first()
      .boundingBox();
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: {
        Valence: Valence.Eight,
      },
      QuerySpecificProperties: {
        RingBondCount: RingBondCount.Three,
        RingSize: RingSize.Nine,
        Connectivity: Connectivity.Six,
      },
    });
    if (point) {
      await page.mouse.move(point.x, point.y);
    }
    await takeEditorScreenshot(page);
  });

  test('Checking preview of list of atoms', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3327
    Description: when label has more than 3 characters then it should be truncated and pop-up text box should be shown on mouse hover
    */
    const atomLabels = [
      PeriodicTableElement.Ca,
      PeriodicTableElement.Pm,
      PeriodicTableElement.Ag,
      PeriodicTableElement.Tc,
      PeriodicTableElement.He,
      PeriodicTableElement.Xe,
      PeriodicTableElement.Li,
      PeriodicTableElement.Ts,
      PeriodicTableElement.Nh,
      PeriodicTableElement.Am,
      PeriodicTableElement.V,
      PeriodicTableElement.Fe,
    ];
    const point = await getAtomLocator(page, { atomLabel: 'C' })
      .first()
      .boundingBox();
    await AtomPropertiesDialog(page).selectAtomType(AtomType.List);
    await AtomPropertiesDialog(page).selectAtomsList({ AtomsList: atomLabels });
    await AtomPropertiesDialog(page).apply();
    if (point) {
      await waitForRender(page, async () => {
        await page.mouse.move(point.x, point.y);
      });
    }
    await takeEditorScreenshot(page);
  });

  test('Checking preview of list of atoms and query specific attributes', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3327
    Description: when label has more than 3 characters then it should be truncated and pop-up text box should be shown on mouse hover
    */
    const atomLabels = [PeriodicTableElement.Rb, PeriodicTableElement.Sm];
    const point = await getAtomLocator(page, { atomLabel: 'C' })
      .first()
      .boundingBox();
    await AtomPropertiesDialog(page).selectAtomType(AtomType.List);
    await AtomPropertiesDialog(page).selectAtomsList({ AtomsList: atomLabels });
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        Aromaticity: Aromaticity.Aromatic,
        ImplicitHCount: ImplicitHCount.Eight,
        RingMembership: RingMembership.Seven,
        RingSize: RingSize.Six,
      },
    });
    if (point) {
      await waitForRender(page, async () => {
        await page.mouse.move(point.x, point.y);
      });
    }
    await takeEditorScreenshot(page);
  });

  test('Setting not SMARTS specific and SMARTS specific attribute', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3459
     * Description: setting not SMARTS specific attribute and taking screenshot to see if it is displayed as before (e.g. rb<n> for ring bond count),
     * adding SMARTS specific attribute (connectivity) and taking screenshot to check if all properties in the list are displayed in SMARTS notation
     * (now ring bond count should be displayed as x<n>)
     */
    let correctLabelIsDisplayed = false;

    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        RingBondCount: RingBondCount.Three,
      },
    });
    correctLabelIsDisplayed = await page.getByText('rb3').isVisible();
    expect(correctLabelIsDisplayed).toBe(true);
    await takeEditorScreenshot(page);

    await doubleClickOnAtom(page, 'C', 0);
    await expect(AtomPropertiesDialog(page).window).toBeVisible();
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        Connectivity: Connectivity.Seven,
      },
    });
    await takeEditorScreenshot(page);
  });
});

test.describe('Checking if atoms are displayed correctly', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonLeftToolbar(page).bondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Escape');
  });

  test('Atom replaced with other from periodic table', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3362
    Description: when you replace an atom with the selected one, no additional symbols should appear next to it.
    */
    await getAtomLocator(page, { atomId: 0 }).click();
    await selectElementFromPeriodicTable(page, PeriodicTableElement.Ti);
    await takeEditorScreenshot(page);
  });
});
