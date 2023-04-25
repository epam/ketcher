import { Page } from '@playwright/test';
import { getLeftToolBarWidth, getTopToolBarHeight } from '@utils';

export async function getLeftTopBarSize(page: Page) {
  const leftBarWidth = await getLeftToolBarWidth(page);
  const topBarHeight = await getTopToolBarHeight(page);

  return { leftBarWidth, topBarHeight };
}
