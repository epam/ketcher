import { Page } from '@playwright/test';
import { test as base } from './coreFixtures';
import { clearLocalStorage } from '@utils/common/helpers';
import { resetZoomLevelToDefault } from '@utils/keyboard';
import { resetSettingsValuesToDefault } from '@tests/pages/molecules/canvas/SettingsDialog';

export const test = base.extend<{
  clearLocalStorage: (page: Page) => Promise<void>;
  resetZoomLevelToDefault: (page: Page) => Promise<void>;
  resetSettingsValuesToDefault: (page: Page) => Promise<void>;
}>({
  clearLocalStorage: async (_fixtures, use) => {
    await use(clearLocalStorage);
  },

  resetZoomLevelToDefault: async (_fixtures, use) => {
    await use(resetZoomLevelToDefault);
  },

  resetSettingsValuesToDefault: async (_fixtures, use) => {
    await use(resetSettingsValuesToDefault);
  },
});
