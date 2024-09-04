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

export const markResetToDefaultState = (resetStateType: ResetStateType) => {
  test.info().annotations.push({ type: 'reset', description: resetStateType });
};

export const processResetToDefaultState = async (
  testInfo: TestInfo,
  page: Page,
) => {
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
