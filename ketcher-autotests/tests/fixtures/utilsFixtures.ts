/* eslint-disable no-empty-pattern */
import { Page } from '@playwright/test';
import { test as base } from './coreFixtures';
import { clearLocalStorage, resetClipboard } from '@utils/common/helpers';
import { resetZoomLevelToDefault } from '@utils/keyboard';
import { resetSettingsValuesToDefault } from '@tests/pages/molecules/canvas/SettingsDialog';

export const test = base.extend<{
  clearLocalStorage: (page: Page) => Promise<void>;
  resetClipboard: (page: Page) => Promise<void>;
  resetZoomLevelToDefault: (page: Page) => Promise<void>;
  resetSettingsValuesToDefault: (page: Page) => Promise<void>;
}>({
  clearLocalStorage: async ({}, use) => {
    await use(clearLocalStorage);
  },

  resetClipboard: async ({}, use) => {
    await use(resetClipboard);
  },

  resetZoomLevelToDefault: async ({}, use) => {
    await use(resetZoomLevelToDefault);
  },

  resetSettingsValuesToDefault: async ({}, use) => {
    await use(resetSettingsValuesToDefault);
  },
});
