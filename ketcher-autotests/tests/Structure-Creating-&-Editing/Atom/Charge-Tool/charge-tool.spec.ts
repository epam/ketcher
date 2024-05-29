import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  takeLeftToolbarScreenshot,
  selectRingButton,
  RingButton,
  moveOnAtom,
  clickInTheMiddleOfTheScreen,
  resetCurrentTool,
  selectLeftPanelButton,
  LeftPanelButton,
  clickOnAtom,
  waitForPageInit,
} from '@utils';

test.describe('Charge tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Hot key for the Charge Plus Tools', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1664
    Description: Charge Plus is applied to the structure atom.
    */
    const anyAtom = 0;
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('Shift++');
    await resetCurrentTool(page);
  });

  test('Hot key for the Charge Minus Tools', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1664
    Description: Charge Minus is applied to the structure atom.
    */
    const anyAtom = 0;
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('-');
    await resetCurrentTool(page);
  });

  test('Change charge on different atoms', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1665
    Description: Charge Minus and Charge Plus is applied to the structure atom.
    */
    const anyAtom = 0;
    const anotherAnyAtom = 2;
    await openFileAndAddToCanvas('Molfiles-V2000/heteroatoms.mol', page);
    await selectLeftPanelButton(LeftPanelButton.ChargePlus, page);
    await clickOnAtom(page, 'N', anyAtom);
    await clickOnAtom(page, 'O', anyAtom);
    await selectLeftPanelButton(LeftPanelButton.ChargeMinus, page);
    await clickOnAtom(page, 'S', anyAtom);
    await clickOnAtom(page, 'O', anotherAnyAtom);
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
    await openFileAndAddToCanvas('Molfiles-V2000/heteroatoms.mol', page);
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('Shift++');
    await page.mouse.move(x, y);
    await page.keyboard.press('Shift++');
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
    await openFileAndAddToCanvas('Molfiles-V2000/heteroatoms.mol', page);
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('-');
    await page.mouse.move(x, y);
    await page.keyboard.press('-');
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
