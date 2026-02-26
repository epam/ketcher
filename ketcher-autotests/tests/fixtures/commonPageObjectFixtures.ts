/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/ban-types */
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

export const test = base.extend<{}, CommonPageObjects>({
  CommonTopRightToolbar: [
    async ({}, use) => {
      await use(CommonTopRightToolbar);
    },
    { scope: 'worker', auto: true },
  ],

  CommonTopLeftToolbar: [
    async ({}, use) => {
      await use(CommonTopLeftToolbar);
    },
    { scope: 'worker', auto: true },
  ],

  MacromoleculesTopToolbar: [
    async ({}, use) => {
      await use(MacromoleculesTopToolbar);
    },
    { scope: 'worker', auto: true },
  ],
});
