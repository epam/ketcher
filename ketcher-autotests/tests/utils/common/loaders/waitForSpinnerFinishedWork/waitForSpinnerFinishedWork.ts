/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { delay } from '@utils/canvas';
import { waitForRender } from '@utils/common';
import { emptyFunction } from '@utils/common/helpers';

export const waitForSpinnerFinishedWork = async (
  page: Page,
  callback: VoidFunction,
  timeout = 250,
) => {
  const loadingSpinner = page.getByTestId('loading-spinner');

  callback();
  await delay(0.2);
  do {
    await loadingSpinner.first().waitFor({ state: 'detached' });
  } while ((await loadingSpinner.count()) > 0);
  await waitForRender(page, emptyFunction, timeout);
};
