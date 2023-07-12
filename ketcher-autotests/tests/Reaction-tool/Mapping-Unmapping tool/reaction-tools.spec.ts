import { test } from '@playwright/test';
import {
  takeLeftToolbarScreenshot,
  LeftPanelButton,
  selectLeftPanelButton,
  selectNestedTool,
  ReactionMappingTool,
  ArrowTool,
  delay,
  DELAY_IN_SECONDS,
  openFileAndAddToCanvas,
} from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await page.waitForSelector('.Ketcher-root');
  });

  test.afterEach(async ({ page }) => {
    await takeLeftToolbarScreenshot(page);
  });

  test('Icons and tooltips for Plus Tool', async ({ page }) => {
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
  });

  test(' Icons and tooltips for Reaction Mapping tools', async ({ page }) => {
    await selectNestedTool(page, ReactionMappingTool.MAP);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ReactionMappingTool.UNMAP);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await openFileAndAddToCanvas('mapped_rection_benz.rxn', page);
    await delay(DELAY_IN_SECONDS.FIVE);
    await selectNestedTool(page, ReactionMappingTool.AUTOMAP);
  });

  test('Icons and tooltips for Arrow Tools', async ({ page }) => {
    await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ArrowTool.ARROW_FILLED_TRIANGLE);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ArrowTool.ARROW_DASHED_OPEN_ANGLE);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ArrowTool.ARROW_FAILED);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ArrowTool.ARROW_BOTH_ENDS_FILLED_TRIANGLE);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_FILLED_HALF_BOW);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_FILLED_TRIANGLE);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_OPEN_ANGLE);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(
      page,
      ArrowTool.ARROW_UNBALANCED_EQUILIBRIUM_FILLED_HALF_BOW,
    );
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(
      page,
      ArrowTool.ARROW_UNBALANCED_EQUILIBRIUM_OPEN_HALF_ANGLE,
    );
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(
      page,
      ArrowTool.ARROW_UNBALANCED_EQUILIBRIUM_LARGE_FILLED_HALF_BOW,
    );
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(
      page,
      ArrowTool.ARROW_UNBALANCED_EQUILIBRIUM_FILLED_HALF_TRIANGLE,
    );
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ArrowTool.ARROW_ELLIPTICAL_ARC_FILLED_BOW);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(
      page,
      ArrowTool.ARROW_ELLIPTICAL_ARC_FILLED_TRIANGLE,
    );
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(page, ArrowTool.ARROW_ELLIPTICAL_ARC_OPEN_ANGLE);
    await delay(DELAY_IN_SECONDS.FIVE);
    await takeLeftToolbarScreenshot(page);

    await selectNestedTool(
      page,
      ArrowTool.ARROW_ELLIPTICAL_ARC_OPEN_HALF_ANGLE,
    );
    await delay(DELAY_IN_SECONDS.FIVE);
  });
});
