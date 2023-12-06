import { Page, test } from '@playwright/test';
import {
  BondTypeName,
  clickInTheMiddleOfTheScreen,
  doubleClickOnAtom,
  getAtomByIndex,
  pressButton,
  selectBond,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
  waitForRender,
} from '@utils';
import {
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
  setAtomicMass,
  setCharge,
  setValence,
} from '../utils';

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
    await page.getByTestId('Query specific-section').click();
    await setRingBondCount(page, '2');
    await setHCount(page, '3');
    await setSubstitutionCount(page, '4');
    await setUnsaturated(page);
    await setAromaticity(page, 'aliphatic');
    await setImplicitHCount(page, '5');
    await setRingMembership(page, '6');
    await setRingSize(page, '7');
    await setConnectivity(page, '8');
    await setChirality(page, 'clockwise');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Setting general atom attributes', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3508
    Description: checking if displaying few general atom attributes near to the lower left atom doesn't broke integrity of the structure
    This test is related to current bug: https://github.com/epam/ketcher/issues/3508
    */
    await setCharge(page, '-8');
    await setAtomicMass(page, '35');
    await setValence(page, 'VIII');
    await pressButton(page, 'Apply');
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
    await selectBond(BondTypeName.Single, page);
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
    await setValence(page, 'VIII');
    await page.getByTestId('Query specific-section').click();
    await setRingBondCount(page, '3');
    await setRingSize(page, '9');
    await setConnectivity(page, '6');
    await pressButton(page, 'Apply');
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
    await page.getByTestId('Query specific-section').click();
    await setAromaticity(page, 'aromatic');
    await setImplicitHCount(page, '8');
    await setRingMembership(page, '7');
    await setRingSize(page, '6');
    await pressButton(page, 'Apply');
    await waitForRender(page, async () => {
      await page.mouse.move(point.x, point.y);
    });
    await takeEditorScreenshot(page);
  });
});
