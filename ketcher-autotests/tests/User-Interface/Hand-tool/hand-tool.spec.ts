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


async function mouseMovement(page: Page, endPoint: { x: number, y: number }) {
  const startPoint = {x: 300, y:300};
  await page.mouse.move(startPoint.x, startPoint.y);
  await page.mouse.down();
  await page.mouse.move(endPoint.x, endPoint.y);
}

test.describe('Hand tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

    test.afterEach(async ({ page }) => {
      await takeEditorScreenshot(page);
    });

  test('Hand tool icon interaction', async ({ page }) => {
    // Test case: EPMLSOPKET-4240
    const button = page.getByTestId('hand');
    await expect(button).toHaveAttribute('title', 'Hand tool (Ctrl+Alt+H)');
    await button.click();
    await moveMouseToTheMiddleOfTheScreen(page);
  
  });

  test('Moving canvas', async ({ page }) => {
    //Test case: EPMLSOPKET-4241
    // Verify if canvas is captured and move with Hand Tool
   await openFileAndAddToCanvas('KET/chain-with-atoms.ket', page);
   await takeEditorScreenshot(page);
   await selectLeftPanelButton(LeftPanelButton.HandTool, page);
   await mouseMovement(page,{x:700, y:300});
  });

  test('Shortcut Ctrl+Alt+H/Cmd+H', async ({ page }) => {
    // Test case: EPMLSOPKET-4243
    // Verify if hot keys changed to Active Hand Tool cursor
    await openFileAndAddToCanvas('KET/chain-with-atoms.ket', page);  
    await page.keyboard.press('Control+Alt+h');
    await mouseMovement(page,{x:700, y:300});
  });

  test('The hand tool is not following the cursor when moving outside the canvas', async ({page}) => {
    // test case: EPMLSOPKET-8937 
    // Verify if hand is not following coursor outside the canvas
    const point = {x: 45, y:148};
    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.mouse.move(point.x, point.y);
  });

  test('Able to scroll canvas down and to the right', async ({ page }) => {
    //Test case: EPMLSOPKET-8937
    // Verify posibility to move cnvas down and to the right 
    await openFileAndAddToCanvas('KET/chain-with-atoms.ket', page);  
    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    await mouseMovement(page, {x:300, y:50});
    await mouseMovement(page, {x:60, y:100});
  });
});
