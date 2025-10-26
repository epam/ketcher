import { Locator, Page } from '@playwright/test';
import { ReactionMappingType } from '@tests/pages/constants/reactionMappingTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';

export async function mapTwoAtoms(page: Page, atom1: Locator, atom2: Locator) {
  await CommonLeftToolbar(page).selectAreaSelectionTool();
  await LeftToolbar(page).selectReactionMappingTool(
    ReactionMappingType.ReactionMapping,
  );
  await atom1.hover();
  await page.mouse.down();
  await atom2.hover();
  await page.mouse.up();
}
