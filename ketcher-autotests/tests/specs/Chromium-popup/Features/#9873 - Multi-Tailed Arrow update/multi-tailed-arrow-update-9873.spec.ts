import { test, expect } from '@playwright/test';
import { waitForPageInit } from '@utils/common/loaders/waitForPageInit';
import { openFileAndAddToCanvas } from '@utils/files/openFileAndAddToCanvas';
import { takeEditorScreenshot } from '@utils/screenshots/takeEditorScreenshot';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectAllStructuresOnCanvas';
import { MultiTailedArrowDialog } from '@tests/pages/molecules/canvas/MultiTailedArrowDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { Page } from '@playwright/test';

async function addMultiTailedArrowToCanvas(page: Page) {
  await LeftToolbar(page).selectReactionArrow('multi-tailed-arrow');
  await page.mouse.move(300, 300);
  await page.mouse.down();
  await page.mouse.move(500, 300);
  await page.mouse.up();
}

test.describe('Multi-Tailed Arrow update', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('should display multi-tailed arrow on canvas after drawing', async ({ page }) => {
    await addMultiTailedArrowToCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('should open properties dialog and update number of tails', async ({ page }) => {
    await addMultiTailedArrowToCanvas(page);
    await page.mouse.dblclick(400, 300);
    const dialog = MultiTailedArrowDialog(page);
    await dialog.setNumberOfTails(3);
    await dialog.confirm();
    await takeEditorScreenshot(page);
  });

  test('should update spine length of multi-tailed arrow', async ({ page }) => {
    await addMultiTailedArrowToCanvas(page);
    await page.mouse.dblclick(400, 300);
    const dialog = MultiTailedArrowDialog(page);
    await dialog.setSpineLength(150);
    await dialog.confirm();
    await takeEditorScreenshot(page);
  });

  test('should cancel update and keep original multi-tailed arrow unchanged', async ({ page }) => {
    await addMultiTailedArrowToCanvas(page);
    await takeEditorScreenshot(page, { name: 'before-cancel' });
    await page.mouse.dblclick(400, 300);
    const dialog = MultiTailedArrowDialog(page);
    await dialog.setNumberOfTails(5);
    await dialog.cancel();
    await takeEditorScreenshot(page, { name: 'after-cancel' });
  });
});