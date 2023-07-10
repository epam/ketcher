import { Page } from '@playwright/test';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';
import { STRUCTURE_LIBRARY_BUTTON_NAME } from './buttons';

/**
 * Opens the Template window
 * Usage: await selectTemplate(page)
 **/
export async function selectTemplate(page: Page) {
  await selectButtonByTitle(STRUCTURE_LIBRARY_BUTTON_NAME, page);
}
