import { MAX_BOND_LENGTH } from '@constants/index';
import { test } from '@playwright/test';
import {
  pressButton,
  takeEditorScreenshot,
  waitForPageInit,
  selectAtomInToolbar,
  AtomButton,
  clickInTheMiddleOfTheScreen,
  takeRightToolbarScreenshot,
  openFileAndAddToCanvas,
  clickOnAtom,
  moveMouseToTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  dragMouseTo,
  waitForRender,
} from '@utils';

test.describe('Atom Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Periodic table dialog', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1403
    Description: The "Periodic table" modal dialog is opened.
    Periodic table' window is closed. No symbols appear on the canvas.
    */
    await selectAtomInToolbar(AtomButton.Periodic, page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');
  });

  test('Periodic table-selecting Atom in palette', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1434
    Description: Pop-up windows appear with Si element.
    After pressing 'Add' button Si element added to canvas.
    */
    await selectAtomInToolbar(AtomButton.Periodic, page);
    await page.getByRole('button', { name: 'Si 14' }).click();
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Creating a new bond with atoms from Periodic table/Palette bar', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1450
    Description: The structure is illustrated as H3Si-SH.
    */
    await selectAtomInToolbar(AtomButton.Sulfur, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAtomInToolbar(AtomButton.Sulfur, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await selectAtomInToolbar(AtomButton.Periodic, page);
    await page.getByRole('button', { name: 'Si 14' }).click();
    await page.getByTestId('OK').click();
    await waitForRender(page, async () => {
      await clickInTheMiddleOfTheScreen(page);
    });
  });
});

test.describe('Atom Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Addition element buttons to right atom panel', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1435
    Description: The additional button with the selected atom symbol appears on the Atom Palette
    */
    const elementNames = [
      'Si 14',
      'Au 79',
      'In 49',
      'Am 95',
      'Se 34',
      'Pu 94',
      'Rn 86',
    ];

    for (const elementName of elementNames) {
      await selectAtomInToolbar(AtomButton.Periodic, page);
      await page.getByRole('button', { name: elementName }).click();
      await page.getByTestId('OK').click();
    }

    await takeRightToolbarScreenshot(page);
  });

  test('Addition 8th element buttons to right atom panel', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1435
    Description: The first additional atom symbol is replaced with the new one. 
    The 8th button isn't added. In our test 'Si' replaces by 'Db'.
    */
    const elementNames = [
      'Si 14',
      'Au 79',
      'In 49',
      'Am 95',
      'Se 34',
      'Pu 94',
      'Rn 86',
      'Db 105',
    ];

    for (const elementName of elementNames) {
      await selectAtomInToolbar(AtomButton.Periodic, page);
      await page.getByRole('button', { name: elementName }).click();
      await page.getByTestId('OK').click();
    }

    await takeRightToolbarScreenshot(page);
  });

  test('Adding to structure a new atom from Periodic table', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1443
    Description: The additional button with the selected atom symbol appears on the Atom Palette.
    Additional atom can be added to structure.
    */
    const elementNames = [
      'Si 14',
      'Au 79',
      'In 49',
      'Am 95',
      'Se 34',
      'Pu 94',
      'Rn 86',
    ];

    for (const elementName of elementNames) {
      await selectAtomInToolbar(AtomButton.Periodic, page);
      await page.getByRole('button', { name: elementName }).click();
      await page.getByTestId('OK').click();
    }

    const anyAtom = 0;
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectAtomInToolbar(AtomButton.Gold, page);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });
});
