import { Page } from '@playwright/test';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';
import { CustomTemplatesButton } from './buttons';

/**
 * Opens the Template window
 * Usage: await selectTemplate(page)
 **/
export async function selectTemplate(page: Page) {
  await selectButtonByTitle(CustomTemplatesButton, page);
}
