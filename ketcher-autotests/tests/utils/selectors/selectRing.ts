import { Page } from '@playwright/test';
import { RingButton } from './buttons';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';

/**
 * Selects a ring from Ring toolbar
 * Usage: await selectRing(RingButton.Benzene, page)
 **/
export async function selectRing(type: RingButton, page: Page) {
  await selectButtonByTitle(type, page);
}
