import { expect, test } from '@playwright/test';
import {
  selectNestedTool,
  SelectTool,
  selectTool,
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  selectRing,
  RingButton,
  moveOnAtom,
  waitForRender,
  TopPanelButton,
  selectTopPanelButton,
  takeEditorScreenshot,
} from '@utils';

test.describe('Hot keys', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await expect(page).toHaveScreenshot();
  });

  test('select last chosen selected tool when user press ESC', async ({
    page,
  }) => {
    await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    await selectTool(LeftPanelButton.AddText, page);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('select-fragment')).toBeVisible();
  });

  test('Shift+Tab to switch selection tool', async ({ page }) => {
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByTestId('select-fragment')).toBeVisible();
  });
});

test.describe('Hot key Del', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('When deleting part of a structure using a hotkey Del, and preview of structure is under mouse cursor, an error not occurs in DevTool console', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3918
     * Description: Part of structure deleted and canvas can be cleared. No console errors.
     */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    const x = 100;
    const y = 100;
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await moveOnAtom(page, 'C', 0);
    });
    await page.keyboard.press('Delete');
    await page.mouse.move(x, y);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await takeEditorScreenshot(page);
  });
});
