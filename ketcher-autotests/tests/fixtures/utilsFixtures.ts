import { Page } from '@playwright/test';
import { test as base } from './coreFixtures';
import { clearLocalStorage } from '@utils/common/helpers';
import { resetZoomLevelToDefault } from '@utils/keyboard';

export const test = base.extend<{
  clearLocalStorage: (page: Page) => Promise<void>;
  resetZoomLevelToDefault: (page: Page) => Promise<void>;
}>({
  // eslint-disable-next-line no-empty-pattern
  clearLocalStorage: async ({}, use) => {
    await use(clearLocalStorage);
  },
  // eslint-disable-next-line no-empty-pattern
  resetZoomLevelToDefault: async ({}, use) => {
    await use(resetZoomLevelToDefault);
  },
});
