import { Page } from '@playwright/test';
import { getToolType, openTool } from './helpers';

/**
 * Select specific tool that has sub / nested levels.
 * This helper rely on the keyboard and use "Tab" and "Enter" buttons
 * to select specific sub / nested level.
 * Throws error if tool do not have nested levels or not found.
 *
 * @param page - playwright page object
 * @param toolElementId - tuple [presses: number, domElementId: string]
 * @param currentToolId - current selectede-group tool
 * presses - specifies the number of times to press Tab key
 * domElementId - id of the element to search
 */
export const selectNestedTool = async (
  page: Page,
  toolElementId: [presses: number, domElementId: string],
  currentToolId?: [presses: number, domElementId: string],
): Promise<void> => {
  const toolType = getToolType(toolElementId[1]);

  const toolTypeValues = Object.values(toolType);

  if (toolType && toolTypeValues.includes(toolElementId)) {
    const defaultToolId =
      (currentToolId && currentToolId[1]) || toolTypeValues[0][1];
    const currentType = toolElementId[1].split('-')[0];
    const lastType = currentToolId && currentToolId[1].split('-')[0];
    await openTool(page, defaultToolId, currentType, lastType);

    const numberOfPresses = toolElementId[0];

    for (let i = 0; i < numberOfPresses; i++) {
      await page.keyboard.press('Tab');
    }

    await page.keyboard.press('Enter');

    return;
  }

  throw Error(
    `Can't find tool. Please, be sure that tool has nested / sub levels.`,
  );
};
