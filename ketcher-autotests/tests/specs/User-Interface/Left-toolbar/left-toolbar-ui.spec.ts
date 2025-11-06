import { test, expect, Page } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import { takeLeftToolbarScreenshot, waitForPageInit } from '@utils';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

test.describe('Left toolbar UI tests', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('left toolbar ui verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await takeLeftToolbarScreenshot(page);
  });

  async function takeDropdownScreenshot(page: Page, width: number) {
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    const screenshot = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width,
        height: bodyHeight,
      },
    });
    expect(screenshot).toMatchSnapshot();
  }

  test('left toolbar selection tool verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await CommonLeftToolbar(page).areaSelectionDropdownButton.click();
    const selectionToolDropdownWidth = 200;
    await takeDropdownScreenshot(page, selectionToolDropdownWidth);
  });

  test('left toolbar bonds verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await CommonLeftToolbar(page).handTool();
    await CommonLeftToolbar(page).bondSelectionDropdownButton.click();
    await CommonLeftToolbar(page).bondSelectionDropdownButton.click();
    const selectionToolDropdownWidth = 700;
    await takeDropdownScreenshot(page, selectionToolDropdownWidth);
  });

  test('left toolbar r-group tool verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await LeftToolbar(page).expandRGroupToolsDropdown();
    const selectionToolDropdownWidth = 200;
    await takeDropdownScreenshot(page, selectionToolDropdownWidth);
  });

  test('left toolbar reaction arrows verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await LeftToolbar(page).expandArrowToolsDropdown();
    const selectionToolDropdownWidth = 700;
    await takeDropdownScreenshot(page, selectionToolDropdownWidth);
  });

  test('left toolbar shapes verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await LeftToolbar(page).expandShapeToolsDropdown();
    const selectionToolDropdownWidth = 200;
    await takeDropdownScreenshot(page, selectionToolDropdownWidth);
  });

  test('stereochemistry ui verification', async ({ page }) => {
    // Test case: EPMLSOPKET-8918
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.SingleUp);
    await getBondLocator(page, { bondId: 8 }).click({ force: true });
    await takeLeftToolbarScreenshot(page);
  });
});
