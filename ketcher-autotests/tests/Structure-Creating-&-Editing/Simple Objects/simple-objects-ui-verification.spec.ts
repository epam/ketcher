import { test, expect } from '@playwright/test';
import { openSimpleObjectsDropdown, waitForPageInit } from '@utils';

test.describe('Verifying buttons on Simple Objects', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Shape Ellipse tooltip', async ({ page }) => {
    // test case: EPMLSOPKET-1949
    const button = page.getByTestId('shape-ellipse');
    await expect(button).toHaveAttribute('title', 'Shape Ellipse');
  });

  test('open Simple Objects and Shape Rectangle tooltip', async ({ page }) => {
    await openSimpleObjectsDropdown(page);
    const button = page.getByTestId('shape-rectangle');
    await expect(button).toHaveAttribute('title', 'Shape Rectangle');
  });

  test('open Simple Objects and Shape Line tooltip', async ({ page }) => {
    await openSimpleObjectsDropdown(page);
    const button = page.getByTestId('shape-line');
    await expect(button).toHaveAttribute('title', 'Shape Line');
  });
});
