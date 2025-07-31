import { Page } from '@playwright/test';
import { test as base } from './coreFixtures';
import { clearLocalStorage } from '@utils/common/helpers';
import { resetZoomLevelToDefault } from '@utils/keyboard';

export const test = base.extend<{
  clearLocalStorage: (page: Page) => Promise<void>;
  resetZoomLevelToDefault: (page: Page) => Promise<void>;
}>({
  clearLocalStorage: async (_, use) => {
    await use(clearLocalStorage);
  },
  resetZoomLevelToDefault: async (_, use) => {
    await use(resetZoomLevelToDefault);
  },
});
