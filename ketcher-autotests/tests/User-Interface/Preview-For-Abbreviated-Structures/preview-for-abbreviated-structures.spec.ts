import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectRingButton,
  clickInTheMiddleOfTheScreen,
  RingButton,
  selectFunctionalGroups,
  FunctionalGroups,
  moveMouseToTheMiddleOfTheScreen,
  BondType,
  waitForPageInit,
} from '@utils';
import { getRightAtomByAttributes } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

async function selectFunctionalGroup(page: Page) {
  // select a functional group from structure library
  await selectFunctionalGroups(FunctionalGroups.Boc, page);
}

/* Show abbreviated structure preview when hovering over atoms or bonds
 * with the template tool selected
 * related to GitHub issue: https://github.com/epam/ketcher/issues/2939
 */
test.describe('Preview for abbreviated structures: functional groups', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    // place a benzene ring in the middle of the screen
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Should show a preview of a functional group when hovering over atom', async ({
    page,
  }) => {
    await selectFunctionalGroup(page);
    const point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    await takeEditorScreenshot(page);
  });

  test('Should hide preview of a functional group when hovering over atom and then moving the mouse away', async ({
    page,
  }) => {
    await selectFunctionalGroup(page);
    const point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Should remove preview and add the functional group to atom in contracted state when clicked', async ({
    page,
  }) => {
    await selectFunctionalGroup(page);
    const point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    await page.mouse.click(point.x, point.y);
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Should remove preview when context menu is shown after right click', async ({
    page,
  }) => {
    await selectFunctionalGroup(page);
    const point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    await takeEditorScreenshot(page);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await takeEditorScreenshot(page);
  });

  test('Should show a preview for a benzene ring on bond', async ({ page }) => {
    const bondId = 2;
    const bondPosition = await getBondByIndex(
      page,
      { type: BondType.SINGLE },
      bondId,
    );
    await page.mouse.move(bondPosition.x, bondPosition.y);
    await takeEditorScreenshot(page);
  });

  test('Should show a preview following the mouse cursor', async ({ page }) => {
    const bondId = 2;
    const shift = 100;
    await selectRingButton(RingButton.Benzene, page);
    const bondPosition = await getBondByIndex(
      page,
      { type: BondType.SINGLE },
      bondId,
    );
    const pointAwayFromBond = {
      x: bondPosition.x + shift,
      y: bondPosition.y + shift,
    };
    await page.mouse.move(pointAwayFromBond.x, pointAwayFromBond.y);
    await takeEditorScreenshot(page);
  });

  test('Should show a preview following the mouse cursor and hide it when a bond is hovered over', async ({
    page,
  }) => {
    const bondId = 2;
    const shift = 100;
    await selectRingButton(RingButton.Benzene, page);
    const bondPosition = await getBondByIndex(
      page,
      { type: BondType.SINGLE },
      bondId,
    );
    const pointAwayFromBond = {
      x: bondPosition.x + shift,
      y: bondPosition.y + shift,
    };
    await takeEditorScreenshot(page);
    await page.mouse.move(pointAwayFromBond.x, pointAwayFromBond.y);
    await takeEditorScreenshot(page);
  });
});
