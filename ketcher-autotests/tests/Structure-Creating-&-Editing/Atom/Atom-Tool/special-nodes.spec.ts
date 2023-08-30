import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  selectAtomInToolbar,
  AtomButton,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
} from '@utils';

test.describe('Special nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    // await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test.skip('H+ calculated values', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1470(2)
    Description: verify Calculated values for H+
    Skipped because of current Calculate Values function issue
  */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'H+', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test.skip('Deuterium calculated values', async ({ page }) => {
    /*
  Test case: EPMLSOPKET-1742
  Description: verify Calculated values for 
  Skipped because of current Calculate Values function issue
*/
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'D', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test.skip('Tritium calculated values', async ({ page }) => {
    /*
  Test case: EPMLSOPKET-1480
  Description: verify Calculated values for Tritium
  Skipped because of current Calculate Values function issue
*/
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'T', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test.skip('R calculated values', async ({ page }) => {
    /*
  Test case: EPMLSOPKET-1482
  Description: verify Calculated values for R
  Skipped because of current Calculate Values function issue
*/
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'R', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test.skip('Pol calculated values', async ({ page }) => {
    /*
  Test case: EPMLSOPKET-1483
  Description: verify Calculated values for Pol
  Skipped because of current Calculate Values function issue
*/
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'Pol', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('UI', async ({ page }) => {
    /*
  Test case: EPMLSOPKET-1468
  Checking UI and functionality of Special Nodes
  buttons in Extended table dialog
*/
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'H+' }).click();
    await page.getByRole('button', { name: 'D', exact: true }).click();
    await page.getByRole('button', { name: 'T', exact: true }).click();
    await page.getByRole('button', { name: 'R', exact: true }).click();
    await page.getByRole('button', { name: 'Pol' }).click();
  });

  test('H+ is present on canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1470 p1
    Description: verify the H+ symbol is added on canvas
  */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'H+', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
  });

  test('H+ adding to the atom of structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1470 p2
    Description: verify the selected atom symbol is changed with "H+"
  */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'H+', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
  });

  test('H+ adding to multiple atoms of structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1470 p3
    Description: verify the selected multiple atom symbols are changed with "H+"
  */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'H+', exact: true }).click();
    await page.getByTestId('OK').click();
    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);
    await clickOnAtom(page, 'F', 0);
    await page.keyboard.up('Shift');
  });

  test('D atom is present on canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1471 p1
    Description: verify the D atom is added on canvas
  */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'D', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
  });

  test('D adding to the atom of structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1471 p2
    Description: verify the selected atom symbol is changed with "D"
  */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'D', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
  });

  test('D adding to multiple atoms of structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1471 p3
    Description: verify the selected multiple atom symbols are changed with "D"
  */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'D', exact: true }).click();
    await page.getByTestId('OK').click();
    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);
    await clickOnAtom(page, 'F', 0);
    await page.keyboard.up('Shift');
  });

  test('T atom is present on canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1473 p1
    Description: verify the T symbol is added on canvas
  */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'T', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
  });

  test('T atom adding to the atom of structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1473 p2
    Description: verify the selected atom symbol is changed with "T"
  */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'T', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
  });

  test('T atom adding to multiple atoms of structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1473 p3
    Description: verify the selected multiple atom symbols are changed with "T"
  */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'T', exact: true }).click();
    await page.getByTestId('OK').click();
    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);
    await clickOnAtom(page, 'F', 0);
    await page.keyboard.up('Shift');
  });

  test('R atom is present on canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1481 p1
    Description: verify the R symbol is added on canvas
  */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'R', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
  });

  test('R atom adding to the atom of structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1481 p2
    Description: verify the selected atom symbol is changed with "R"
  */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'R', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
  });

  test('R atom adding to multiple atoms of structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1481 p3
    Description: verify the selected multiple atom symbols are changed with "R"
  */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'R', exact: true }).click();
    await page.getByTestId('OK').click();
    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);
    await clickOnAtom(page, 'F', 0);
    await page.keyboard.up('Shift');
  });

  test('Pol atom is present on canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1483 p1
    Description: verify the Pol symbol is added on canvas
  */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'Pol', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Pol atom adding to the atom of structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1483 p2
    Description: verify the selected atom symbol is changed with "Pol"
  */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'Pol', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickOnAtom(page, 'S', 0);
  });

  test('Pol atom adding to multiple atoms of structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1483 p3
    Description: verify the selected multiple atom symbols are changed with "Pol"
  */
    await openFileAndAddToCanvas('Heteroatoms.mol', page);
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'Pol', exact: true }).click();
    await page.getByTestId('OK').click();
    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);
    await clickOnAtom(page, 'F', 0);
    await page.keyboard.up('Shift');
  });
});

test.describe('Special node', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('H+ recognition', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1470(1)
        Description: verify the H+ symbol recognition
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'H+', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Check, page);
    await takeEditorScreenshot(page, {
      masks: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
  });

  test('Deuterium recognition', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1741
    Description: verify the D symbol recognition
  */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'D', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Check, page);
    await takeEditorScreenshot(page, {
      masks: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
  });

  test('Tritium recognition', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1473
    Description: verify the T symbol recognition
  */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'T', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Check, page);
    await takeEditorScreenshot(page, {
      masks: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
  });

  test('R recognition', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1481
    Description: verify the R symbol recognition
  */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'R', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Check, page);
    await takeEditorScreenshot(page, {
      masks: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
  });

  test('Pol recognition', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1484
    Description: verify the Pol symbol recognition
  */
    await selectAtomInToolbar(AtomButton.Extended, page);
    await page.getByRole('button', { name: 'Pol', exact: true }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Check, page);
    await takeEditorScreenshot(page, {
      masks: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
  });
});
