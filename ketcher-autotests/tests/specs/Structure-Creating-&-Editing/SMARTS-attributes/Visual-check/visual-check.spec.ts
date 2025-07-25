import { Page, test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  doubleClickOnAtom,
  pressButton,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { selectElementFromPeriodicTable } from '@tests/pages/molecules/canvas/PeriodicTableDialog';
import { PeriodicTableElement } from '@tests/pages/constants/periodicTableDialog/Constants';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import {
  Aromaticity,
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

async function setListOfAtoms(page: Page, atomLabels: string[]) {
  await selectAtomType(page, 'List');
  await page.getByTestId('General-section').locator('button').click();
  for (const label of atomLabels) {
    await page.getByTestId(`${label}-button`).click();
  }
  await page.getByRole('button', { name: 'Add', exact: true }).click();
}

async function selectAtomType(page: Page, type: string) {
  await page.locator('label').filter({ hasText: 'Atom Type' }).click();
  await page.getByRole('option', { name: type, exact: true }).click();
}

test.describe('Checking if displaying atom attributes does not broke integrity of the structure', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 3;
    await waitForPageInit(page);
    await page.getByRole('button', { name: 'Cyclooctane (T)' }).click();
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
    await waitForAtomPropsModal(page);
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
    await AtomPropertiesDialog(page).pressApplyButton();
    await takeEditorScreenshot(page);
  });

  test('Setting list of atoms', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3508
    Description: checking if displaying list of atoms near to the lower left atom doesn't broke integrity of the structure
    This test is related to current bug: https://github.com/epam/ketcher/issues/3508
    */
    const atomLabels = ['Na', 'K', 'B', 'Er', 'Se'];
    await setListOfAtoms(page, atomLabels);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });
});

test.describe('Checking if preview of attributes is displayed correctly after hover', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    await waitForPageInit(page);
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
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
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
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
    await waitForRender(page, async () => {
      await page.mouse.move(point.x, point.y);
    });
    await takeEditorScreenshot(page);
  });

  test('Checking preview of list of atoms', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3327
    Description: when label has more than 3 characters then it should be truncated and pop-up text box should be shown on mouse hover
    */
    const atomLabels = [
      'Ca',
      'Pm',
      'Ag',
      'Tc',
      'He',
      'Xe',
      'Li',
      'Ts',
      'Nh',
      'Am',
      'V',
      'Fe',
    ];
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await setListOfAtoms(page, atomLabels);
    await pressButton(page, 'Apply');
    await waitForRender(page, async () => {
      await page.mouse.move(point.x, point.y);
    });
    await takeEditorScreenshot(page);
  });

  test('Checking preview of list of atoms and query specific attributes', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3327
    Description: when label has more than 3 characters then it should be truncated and pop-up text box should be shown on mouse hover
    */
    const atomLabels = ['Rb', 'Sm'];
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await setListOfAtoms(page, atomLabels);
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        Aromaticity: Aromaticity.Aromatic,
        ImplicitHCount: ImplicitHCount.Eight,
        RingMembership: RingMembership.Seven,
        RingSize: RingSize.Six,
      },
    });
    await waitForRender(page, async () => {
      await page.mouse.move(point.x, point.y);
    });
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
    await waitForAtomPropsModal(page);
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
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Escape');
  });

  test('Atom replaced with other from periodic table', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3362
    Description: when you replace an atom with the selected one, no additional symbols should appear next to it.
    */
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    const pixelsToMoveMouse = 100;
    await selectElementFromPeriodicTable(page, PeriodicTableElement.Ti);
    await clickOnCanvas(page, point.x, point.y);
    await page.mouse.move(pixelsToMoveMouse, pixelsToMoveMouse);
    await takeEditorScreenshot(page);
  });
});
