import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectRingButton,
  clickInTheMiddleOfTheScreen,
  RingButton,
  selectTemplate,
  selectFunctionalGroups,
  FunctionalGroups,
  delay,
  moveMouseToTheMiddleOfTheScreen,
} from '@utils';
import { getRightAtomByAttributes } from '@utils/canvas/atoms';

/* Show abbreviated structure preview when hovering over atoms or bonds
 * with the template tool selected
 * related to GitHub issue: https://github.com/epam/ketcher/issues/2939
 */
test.describe('Preview for abbreviated structures: functional groups', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');

    // place a benzene ring in the middle of the screen
    // and select a functional group from structure library
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTemplate(page);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
  });

  test('Should show a preview of a functional group when hovering over atom', async ({
    page,
  }) => {
    const point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    // delay is required because preview is shown with delay
    await delay(1);

    await takeEditorScreenshot(page);
  });

  test('Should hide preview of a functional group when hovering over atom and then moving the mouse away', async ({
    page,
  }) => {
    const point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    // delay is required because preview is shown with delay
    await delay(1);
    await moveMouseToTheMiddleOfTheScreen(page);

    await delay(1);
    await takeEditorScreenshot(page);
  });

  test('Should hide preview of a functional group when hovering over atom', async ({
    page,
  }) => {
    const point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    // delay is required because preview is shown with delay
    await delay(1);
    await moveMouseToTheMiddleOfTheScreen(page);

    await delay(1);
    await takeEditorScreenshot(page);
  });

  test('Should remove preview and add the functional group to atom in contracted state when clicked', async ({
    page,
  }) => {
    const point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    // delay is required because preview is shown with delay
    await delay(1);
    await page.mouse.click(point.x, point.y);
    await moveMouseToTheMiddleOfTheScreen(page);

    await takeEditorScreenshot(page);
  });
});
