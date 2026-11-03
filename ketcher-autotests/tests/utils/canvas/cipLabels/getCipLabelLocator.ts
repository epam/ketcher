import { Page } from '@playwright/test';

const LABEL_TEXT = { atom: /^\([RSrs]\)$/, bond: /^\([EZMP]\)$/ };

export function getCipLabelLocator(page: Page, owner: 'atom' | 'bond') {
  return page
    .locator('[data-testid="cip-label"]')
    .filter({ hasText: LABEL_TEXT[owner] });
}
