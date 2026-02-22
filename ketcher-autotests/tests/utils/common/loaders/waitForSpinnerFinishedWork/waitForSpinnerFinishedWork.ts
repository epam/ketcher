/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { emptyFunction } from '../../helpers';
import { waitForRender } from '../waitForRender';

export const waitForSpinnerFinishedWork = async (
  page: Page,
  callback: VoidFunction,
  timeout = 250,
) => {
  const loadingSpinner = page.getByTestId('loading-spinner');

  callback();
  do {
    await page.waitForTimeout(200);
    await loadingSpinner.first().waitFor({ state: 'detached' });
  } while ((await loadingSpinner.count()) > 0);
  await waitForRender(page, emptyFunction, timeout);
};
