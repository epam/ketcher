import {
  CommonTopLeftToolbar,
  CommonTopLeftToolbarType,
} from '@tests/pages/common/CommonTopLeftToolbar';
import { test as base } from './coreFixtures';
import {
  CommonTopRightToolbar,
  CommonTopRightToolbarType,
} from '@tests/pages/common/CommonTopRightToolbar';
import {
  MacromoleculesTopToolbar,
  MacromoleculesTopToolbarType,
} from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { Page } from '@playwright/test';

type CommonPageObjects = {
  CommonTopRightToolbar: (page: Page) => CommonTopRightToolbarType;
  MacromoleculesTopToolbar: (page: Page) => MacromoleculesTopToolbarType;
  CommonTopLeftToolbar: (page: Page) => CommonTopLeftToolbarType;
};

export const test = base.extend<CommonPageObjects>({
  // eslint-disable-next-line no-empty-pattern
  CommonTopRightToolbar: async ({}, use) => {
    await use(CommonTopRightToolbar);
  },
  // eslint-disable-next-line no-empty-pattern
  CommonTopLeftToolbar: async ({}, use) => {
    await use(CommonTopLeftToolbar);
  },
  // eslint-disable-next-line no-empty-pattern
  MacromoleculesTopToolbar: async ({}, use) => {
    await use(MacromoleculesTopToolbar);
  },
});
