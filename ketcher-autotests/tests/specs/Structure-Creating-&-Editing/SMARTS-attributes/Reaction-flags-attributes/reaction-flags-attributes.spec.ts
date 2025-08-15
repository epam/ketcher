import { Page, test } from '@fixtures';
import {
  checkSmartsValue,
  checkSmartsWarnings,
  clickInTheMiddleOfTheScreen,
  doubleClickOnAtom,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
} from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { Inversion } from '@tests/pages/constants/atomProperties/Constants';

const expectedSmarts = '[#6](-[#6])(-[#6])-[#6]';

async function drawStructure(page: Page, numberOfClicks: number) {
  await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
  for (let i = 0; i < numberOfClicks; i++) {
    await clickInTheMiddleOfTheScreen(page);
  }
}

async function drawStructureAndDoubleClickOnAtom(
  page: Page,
  numberOfBondsAtStructure: number,
  atomType: string,
  numberOfAtom: number,
) {
  await waitForPageInit(page);
  await drawStructure(page, numberOfBondsAtStructure);
  await page.keyboard.press('Escape');
  await doubleClickOnAtom(page, atomType, numberOfAtom);
  await waitForAtomPropsModal(page);
}

test.describe('Checking atom properties attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    const numberOfBondsAtStructure = 3;
    await drawStructureAndDoubleClickOnAtom(
      page,
      numberOfBondsAtStructure,
      'C',
      numberOfAtom,
    );
  });

  test('Setting reaction flag - Inverts', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3431
     * Description: setting reaction flag - inverts should have no impact on SMARTS output but warning should be displayed
     */
    await AtomPropertiesDialog(page).setOptions({
      ReactionFlags: {
        Inversion: Inversion.Inverts,
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, expectedSmarts);
    await checkSmartsWarnings(page);
  });

  test('Setting reaction flag - Retains', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3431
     * Description: setting reaction flag - retains should have no impact on SMARTS output but warning should be displayed
     */
    await AtomPropertiesDialog(page).setOptions({
      ReactionFlags: {
        Inversion: Inversion.Retains,
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, expectedSmarts);
    await checkSmartsWarnings(page);
  });

  test('Setting reaction flag - Exact change checked', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3431
     * Description: checking exact change option at reaction flag section should have no impact on SMARTS output but warning should be displayed
     */
    await AtomPropertiesDialog(page).setOptions({
      ReactionFlags: {
        ExactChangeCheckbox: true,
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, expectedSmarts);
    await checkSmartsWarnings(page);
  });
});
