import { test } from '@fixtures';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  takeLeftToolbarScreenshot,
  moveOnAtom,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  waitForPageInit,
  pasteFromClipboardAndOpenAsNewProject,
} from '@utils';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';

test.describe('Charge tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Hot key for the Charge Plus Tools', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1664
    Description: Charge Plus is applied to the structure atom.
    */
    const anyAtom = 0;
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('Shift++');
    await CommonLeftToolbar(page).areaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Hot key for the Charge Minus Tools', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1664
    Description: Charge Minus is applied to the structure atom.
    */
    const anyAtom = 0;
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('-');
    await CommonLeftToolbar(page).areaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Change charge on different atoms', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1665
    Description: Charge Minus and Charge Plus is applied to the structure atom.
    */
    const anyAtom = 0;
    const anotherAnyAtom = 2;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/heteroatoms.mol');
    await LeftToolbar(page).chargePlus();
    await clickOnAtom(page, 'N', anyAtom);
    await clickOnAtom(page, 'O', anyAtom);
    await LeftToolbar(page).chargeMinus();
    await clickOnAtom(page, 'S', anyAtom);
    await clickOnAtom(page, 'O', anotherAnyAtom);
    await takeEditorScreenshot(page);
  });

  test('Check that pressing the hot button Charge Plus on an atom applies the correct charge', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8919
    Description: Charge Plus is applied to the structure atom.
    When you click outside atom atoms are not changed.
    */
    const anyAtom = 0;
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/heteroatoms.mol');
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('Shift++');
    await page.mouse.move(x, y);
    await page.keyboard.press('Shift++');
    await takeEditorScreenshot(page);
  });

  test('Check that pressing the hot button Charge Minus on an atom applies the correct charge', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8919
    Description: Charge Minus is applied to the structure atom.
    When you click outside atom atoms are not changed.
    */
    const anyAtom = 0;
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/heteroatoms.mol');
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('-');
    await page.mouse.move(x, y);
    await page.keyboard.press('-');
    await takeEditorScreenshot(page);
  });

  test('Charge Plus tool works on star atoms', async ({ page }) => {
    /*
    Test case: Fix for star atom charge issue
    Description: Charge Plus and Charge Minus are applied to star atoms.
    */
    const anyAtom = 0;
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '*1C=*C=*C=1 |$star_e;;star_e;;star_e;$|',
    );
    await LeftToolbar(page).chargePlus();
    await clickOnAtom(page, '*', anyAtom);
    await clickOnAtom(page, '*', anyAtom);
    await LeftToolbar(page).chargeMinus();
    await clickOnAtom(page, '*', 1);
    await takeEditorScreenshot(page);
  });
});

test.describe('Charge tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Verify the icon and tooltips for the Charge Plus/Charge Minus button', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1662, EPMLSOPKET-1663
    Description: The correct icon for the 'Charge Plus' and 'Charge Minus' is present in the Toolbar.
    */
    await takeLeftToolbarScreenshot(page);
  });
});
