import { test, expect } from '@playwright/test';
import {
  BondType,
  clickOnBond,
  drawBenzeneRing,
  takeLeftToolbarScreenshot,
} from '@utils';

test.describe('Left toolbar UI tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('left toolbar ui verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await takeLeftToolbarScreenshot(page);
  });

  test('left toolbar selection tool verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await page.getByTestId('select-rectangle').click();
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    const selectionToolDropdownWidth = 200;
    const screenshot = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: selectionToolDropdownWidth,
        height: bodyHeight,
      },
    });
    expect(screenshot).toMatchSnapshot();
  });

  test('left toolbar bonds verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await page.getByTestId('bonds').click();
    await page.getByTestId('bonds').click();
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    const bondDropdownWidth = 700;
    const screenshot = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: bondDropdownWidth,
        height: bodyHeight,
      },
    });
    expect(screenshot).toMatchSnapshot();
  });

  test('left toolbar r-group tool verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await page.getByTestId('rgroup-label').click();
    await page.getByTestId('rgroup-label').click();
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    const rGroupDropdownWidth = 200;
    const screenshot = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: rGroupDropdownWidth,
        height: bodyHeight,
      },
    });
    expect(screenshot).toMatchSnapshot();
  });

  test('left toolbar reaction arrows verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await page.getByTestId('reaction-arrow-open-angle').click();
    await page.getByTestId('reaction-arrow-open-angle').click();
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    const reactionArrowDropdownWidth = 700;
    const screenshot = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: reactionArrowDropdownWidth,
        height: bodyHeight,
      },
    });
    expect(screenshot).toMatchSnapshot();
  });

  test('left toolbar shapes verification', async ({ page }) => {
    // Test case: EPMLSOPKET-4268
    await page.getByTestId('shape-ellipse').click();
    await page.getByTestId('shape-ellipse').click();
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    const shapesDropdownWidth = 200;
    const screenshot = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: shapesDropdownWidth,
        height: bodyHeight,
      },
    });
    expect(screenshot).toMatchSnapshot();
  });

  test('stereochemistry ui verification', async ({ page }) => {
    // Test case: EPMLSOPKET-8918
    await drawBenzeneRing(page);
    await page.getByTestId('bonds').click();
    await page.getByTestId('bonds').click();
    await page.getByTestId('bond-up').click();
    const bondNumber = 2;
    await clickOnBond(page, BondType.SINGLE, bondNumber);
    await takeLeftToolbarScreenshot(page);
  });
});
