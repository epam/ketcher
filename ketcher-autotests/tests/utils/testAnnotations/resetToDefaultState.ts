import { Page, test, TestInfo } from '@playwright/test';
import { selectFlexLayoutModeTool } from '@utils/canvas';
import {
  chooseTab,
  Tabs,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';

const resetStateTypes = {
  defaultLayout: async (page: Page) => {
    await selectFlexLayoutModeTool(page);
  },
  tabSelection: async (page: Page) => {
    await chooseTab(page, Tabs.Peptides);
  },
  micromoleculesEditor: async (page: Page) => {
    await turnOnMicromoleculesEditor(page);
  },
  macromoleculesEditor: async (page: Page) => {
    await turnOnMacromoleculesEditor(page);
  },
};

type ResetStateType = keyof typeof resetStateTypes;

/**
 * Registers a specific state reset action for the current test.
 * You can mark reset actions for dropdowns, open windows, or other UI elements that
 * need to be restored to their default state after the test.
 *
 * Note: Use `markResetToDefaultState` if you expect certain states (like open windows or dropdowns)
 * to remain open after a test. In other cases, where you can manually handle resetting,
 * it's usually more efficient to write reset logic directly in the test.
 *
 * @param {ResetStateType} resetStateType - The type of state reset to perform after the test.
 */
export const markResetToDefaultState = (resetStateType: ResetStateType) => {
  test.info().annotations.push({ type: 'reset', description: resetStateType });
};

/**
 * Processes and executes all registered state reset actions after a test completes.
 * This function ensures that states marked during the test (via `markResetToDefaultState`)
 * are reset to their default state.
 *
 * It's recommended to call this method after `selectClearCanvasTool` to ensure
 * that no modals, dropdowns, or other UI elements block the reset actions.
 *
 * Note: Use `processResetToDefaultState` when your tests involve complex UI changes
 * (such as opening windows or switching tabs). If not, consider writing the reset logic
 * directly in the test for simplicity.
 *
 * @param {TestInfo} testInfo - Information about the current test.
 * @param {Page} page - The Playwright page instance.
 */
export const processResetToDefaultState = async (
  testInfo: TestInfo,
  page: Page,
) => {
  if (testInfo.status != 'passed') {
    return;
  }

  const resetActions = testInfo.annotations
    .filter((a) => a.type === 'reset')
    .map((a) => a.description as ResetStateType);

  for (const resetTypeStr in resetStateTypes) {
    const resetType = resetTypeStr as ResetStateType;

    if (resetActions.includes(resetType)) {
      await resetStateTypes[resetType](page);
    }
  }
};
