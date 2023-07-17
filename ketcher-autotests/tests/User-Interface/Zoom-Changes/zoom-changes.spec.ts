import { test, expect } from '@playwright/test';
import { takeEditorScreenshot, clickInTheMiddleOfTheScreen } from '@utils';
import { TestIdSelectors } from '../../utils/selectors/testIdSelectors';

const randomNegativeNumber = -60;
const randomPositiveNumber = 60;

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  /* Editor is zoomed correctly: */
  /* Zoom in */
  test('when using ctrl + mouse scroll up', async ({ page }) => {
    await clickInTheMiddleOfTheScreen(page);

    await page.keyboard.down('Control');
    await page.mouse.wheel(0, randomNegativeNumber);
    await page.mouse.wheel(0, randomNegativeNumber);
    await page.keyboard.up('Control');

    const zoomInput = page.getByTestId(TestIdSelectors.ZoomInput);
    const zoomInputValue = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );

    expect(zoomInputValue).toBe('120%');
  });

  /* Zoom out */
  test('when using ctrl + mouse scroll down', async ({ page }) => {
    await clickInTheMiddleOfTheScreen(page);

    await page.keyboard.down('Control');
    await page.mouse.wheel(0, randomPositiveNumber);
    await page.mouse.wheel(0, randomPositiveNumber);
    await page.keyboard.up('Control');

    const zoomInput = page.getByTestId(TestIdSelectors.ZoomInput);
    const zoomInputValue = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );

    expect(zoomInputValue).toBe('80%');
  });
});
