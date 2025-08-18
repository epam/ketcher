import { test, expect } from '@fixtures';
import { ShapeType } from '@tests/pages/constants/shapeSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { waitForPageInit } from '@utils';

test.describe('Verifying buttons on Simple Objects', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Shape Ellipse tooltip', async ({ page }) => {
    // test case: EPMLSOPKET-1949
    const button = page.getByTestId(ShapeType.Ellipse);
    await expect(button).toHaveAttribute('title', 'Shape Ellipse');
  });

  test('open Simple Objects and Shape Rectangle tooltip', async ({ page }) => {
    await LeftToolbar(page).expandShapeToolsDropdown();
    const button = page.getByTestId(ShapeType.Rectangle);
    await expect(button).toHaveAttribute('title', 'Shape Rectangle');
  });

  test('open Simple Objects and Shape Line tooltip', async ({ page }) => {
    await LeftToolbar(page).expandShapeToolsDropdown();
    const button = page.getByTestId(ShapeType.Line);
    await expect(button).toHaveAttribute('title', 'Shape Line');
  });
});
