import { test } from '@playwright/test';
import {
  takeLeftToolbarScreenshot,
  LeftPanelButton,
  selectLeftPanelButton,
  selectNestedTool,
  ReactionMappingTool,
  ArrowTool,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';

test.describe('Reaction Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeLeftToolbarScreenshot(page);
  });

  test('Icons and tooltips for Plus Tool', async ({ page }) => {
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
  });
});

test.describe('Reaction Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Icons and tooltips for Reaction Mapping tools', async ({ page }) => {
    const mappingTools = [
      ReactionMappingTool.MAP,
      ReactionMappingTool.UNMAP,
      ReactionMappingTool.AUTOMAP,
    ];

    for (const tool of mappingTools) {
      await selectNestedTool(page, tool);
      await takeLeftToolbarScreenshot(page);

      if (tool === ReactionMappingTool.AUTOMAP) {
        await openFileAndAddToCanvas('Rxn-V2000/mapped-rection-benz.rxn', page);
      }
    }
  });

  test('Icons and tooltips for Arrow Tools', async ({ page }) => {
    const arrowTools = [
      ArrowTool.ARROW_OPEN_ANGLE,
      ArrowTool.ARROW_FILLED_TRIANGLE,
      ArrowTool.ARROW_FILLED_BOW,
      ArrowTool.ARROW_DASHED_OPEN_ANGLE,
      ArrowTool.ARROW_FAILED,
      ArrowTool.ARROW_BOTH_ENDS_FILLED_TRIANGLE,
      ArrowTool.ARROW_EQUILIBRIUM_FILLED_HALF_BOW,
      ArrowTool.ARROW_EQUILIBRIUM_FILLED_TRIANGLE,
      ArrowTool.ARROW_EQUILIBRIUM_OPEN_ANGLE,
      ArrowTool.ARROW_UNBALANCED_EQUILIBRIUM_FILLED_HALF_BOW,
      ArrowTool.ARROW_UNBALANCED_EQUILIBRIUM_OPEN_HALF_ANGLE,
      ArrowTool.ARROW_UNBALANCED_EQUILIBRIUM_LARGE_FILLED_HALF_BOW,
      ArrowTool.ARROW_UNBALANCED_EQUILIBRIUM_FILLED_HALF_TRIANGLE,
      ArrowTool.ARROW_ELLIPTICAL_ARC_FILLED_BOW,
      ArrowTool.ARROW_ELLIPTICAL_ARC_FILLED_TRIANGLE,
      ArrowTool.ARROW_ELLIPTICAL_ARC_OPEN_ANGLE,
      ArrowTool.ARROW_ELLIPTICAL_ARC_OPEN_HALF_ANGLE,
    ];

    for (const tool of arrowTools) {
      await selectNestedTool(page, tool);
      await takeLeftToolbarScreenshot(page);
    }
  });
});
