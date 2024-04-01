import { Page, test, expect } from '@playwright/test';
import {
  LeftPanelButton,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  pressButton,
  selectLeftPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

async function mouseMovement(page: Page, endPoint: { x: number; y: number }) {
  const startPoint = { x: 300, y: 300 };
  await page.mouse.move(startPoint.x, startPoint.y);
  await page.mouse.down();
  await page.mouse.move(endPoint.x, endPoint.y);
}

test.describe('Hand tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Hand tool icon tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-4240
    const icon = {
      testId: 'hand',
      title: 'Hand tool (Ctrl+Alt+H)',
    };
    const iconButton = page.getByTestId(icon.testId);
    await expect(iconButton).toHaveAttribute('title', icon.title);
    await iconButton.hover();
    expect(icon.title).toBeTruthy();
  });

  test('Moving canvas', async ({ page }) => {
    // Test case: EPMLSOPKET-4241
    // Verify if canvas is captured and move with Hand Tool
    await openFileAndAddToCanvas('KET/chain-with-atoms.ket', page);
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    await mouseMovement(page, { x: 700, y: 300 });
    await takeEditorScreenshot(page);
  });

  test('Shortcut Ctrl+Alt+H/Cmd+H', async ({ page }) => {
    // Test case: EPMLSOPKET-4243
    // Verify if hot keys changed to Active Hand Tool cursor
    await openFileAndAddToCanvas('KET/chain-with-atoms.ket', page);
    await page.keyboard.press('Control+Alt+h');
    await mouseMovement(page, { x: 700, y: 300 });
    await takeEditorScreenshot(page);
  });

  test('The hand tool is not following the cursor when moving outside the canvas', async ({
    page,
  }) => {
    // test case: EPMLSOPKET-8937
    // Verify if hand is not following coursor outside the canvas
    const point = { x: 45, y: 148 };
    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.mouse.move(point.x, point.y);
    await takeEditorScreenshot(page);
  });

  test('Able to scroll canvas down and to the right', async ({ page }) => {
    // Test case: EPMLSOPKET-8937
    // Verify posibility to move cnvas down and to the right
    await openFileAndAddToCanvas('KET/chain-with-atoms.ket', page);
    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    await mouseMovement(page, { x: 300, y: 50 });
    await mouseMovement(page, { x: 60, y: 100 });
    await takeEditorScreenshot(page);
  });
});
