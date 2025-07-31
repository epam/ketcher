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
  CommonTopRightToolbar: async (_, use) => {
    await use(CommonTopRightToolbar);
  },
  CommonTopLeftToolbar: async (_, use) => {
    await use(CommonTopLeftToolbar);
  },
  MacromoleculesTopToolbar: async (_, use) => {
    await use(MacromoleculesTopToolbar);
  },
});
