import { test } from '@playwright/test';
import {
  selectNestedTool,
  BondTool,
  ShapeTool,
  RotateTool,
  ArrowTool,
  ReactionMappingTool,
  RgroupTool,
  SelectTool,
} from '@utils/canvas/tools/selectNestedTool';
import { waitForPageInit } from '@utils/common';

// shows the usage of selectNestedTool for autotesters
test.skip('use tripple bond tool', async ({ page }) => {
  await waitForPageInit(page);
  await selectNestedTool(page, BondTool.TRIPPLE);
});

test.skip('use shape rectangle tool', async ({ page }) => {
  await waitForPageInit(page);
  await selectNestedTool(page, ShapeTool.SHAPE_RECTANGLE);
});

test.skip('use selection tool', async ({ page }) => {
  await waitForPageInit(page);
  await selectNestedTool(page, SelectTool.LASSO_SELECTION);
});

test.skip('use vertical rotate tool', async ({ page }) => {
  await waitForPageInit(page);
  await selectNestedTool(page, RotateTool.VERTICAL_FLIP);
});

test.skip('use arrow tool', async ({ page }) => {
  await waitForPageInit(page);
  await selectNestedTool(page, ArrowTool.ARROW_ELLIPTICAL_ARC_OPEN_ANGLE);
});

test.skip('use reaction tool', async ({ page }) => {
  await waitForPageInit(page);
  await selectNestedTool(page, ReactionMappingTool.MAP);
});

test.skip('use rgroup tool', async ({ page }) => {
  await waitForPageInit(page);
  await selectNestedTool(page, RgroupTool.R_GROUP_FRAGMENT);
});
