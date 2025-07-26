import { Page, test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  doubleClickOnAtom,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
} from '@utils';
import { checkSmartsValue, checkSmartsWarnings } from '../utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import {
  AtomPropertiesSettings,
  Radical,
  Valence,
} from '@tests/pages/constants/atomProperties/Constants';

async function drawStructure(page: Page, numberOfClicks: number) {
  await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
  for (let i = 0; i < numberOfClicks; i++) {
    await clickInTheMiddleOfTheScreen(page);
  }
}

async function setAndCheckAtomProperties(
  page: Page,
  options: AtomPropertiesSettings,
  expectedSmarts: string,
) {
  await AtomPropertiesDialog(page).setOptions(options);
  await takeEditorScreenshot(page);
  await checkSmartsValue(page, expectedSmarts);
}

test.describe('Checking atom properties attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    const numberOfBondsAtStructure = 3;
    await waitForPageInit(page);
    await drawStructure(page, numberOfBondsAtStructure);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
    await waitForAtomPropsModal(page);
  });

  test('Setting atom label and checking the atom number', async ({ page }) => {
    await setAndCheckAtomProperties(
      page,
      { GeneralProperties: { Label: 'Cr' } },
      '[#6](-[#6])(-[Cr])-[#6]',
    );
  });

  test('Setting charge to zero', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3339
     * Test is failing due to bug https://github.com/epam/Indigo/issues/1438
     */
    test.fail();
    await setAndCheckAtomProperties(
      page,
      { GeneralProperties: { Charge: '0' } },
      '[#6](-[#6])(-[#6;+0])-[#6]',
    );
  });

  test('Setting positive charge', async ({ page }) => {
    await setAndCheckAtomProperties(
      page,
      { GeneralProperties: { Charge: '10' } },
      '[#6](-[#6])(-[#6;+10])-[#6]',
    );
  });

  test('Setting negative charge', async ({ page }) => {
    await setAndCheckAtomProperties(
      page,
      { GeneralProperties: { Charge: '-15' } },
      '[#6](-[#6])(-[#6;-15])-[#6]',
    );
  });

  test('Setting atomic mass', async ({ page }) => {
    await setAndCheckAtomProperties(
      page,
      { GeneralProperties: { Isotope: '30' } },
      '[#6](-[#6])(-[#6;30])-[#6]',
    );
  });

  test('Setting isotope (atomic mass) to zero', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3339
     * Test is failing due to bug https://github.com/epam/Indigo/issues/1438
     */
    test.fail();
    await setAndCheckAtomProperties(
      page,
      { GeneralProperties: { Isotope: '0' } },
      '[#6](-[#6])(-[#6;0])-[#6]',
    );
  });

  test('Setting valence', async ({ page }) => {
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1362 is fixed
     */
    await setAndCheckAtomProperties(
      page,
      { GeneralProperties: { Valence: Valence.Four } },
      '[#6](-[#6])(-[#6;v4])-[#6]',
    );
  });

  test('Setting radical', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3431
     * Description: setting redical option should have no impact on SMARTS output but warning should be displayed
     */
    await setAndCheckAtomProperties(
      page,
      { GeneralProperties: { Radical: Radical.Monoradical } },
      '[#6](-[#6])(-[#6])-[#6]',
    );
    await checkSmartsWarnings(page);
  });

  test('Check that cannot add Charge more than -15', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3943
     * Description: Validation should be added +-15 range allowed only
     */
    await AtomPropertiesDialog(page).fillCharge('-16');
    expect(AtomPropertiesDialog(page).applyButton).toBeDisabled();
  });

  test('Check that cannot add Charge more than 15', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3943
     * Description: Validation should be added +-15 range allowed only
     */
    await AtomPropertiesDialog(page).fillCharge('16');
    expect(AtomPropertiesDialog(page).applyButton).toBeDisabled();
  });
});
