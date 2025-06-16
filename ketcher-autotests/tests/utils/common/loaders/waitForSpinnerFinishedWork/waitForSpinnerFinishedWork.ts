import { Page } from '@playwright/test';
import { waitForRender } from '@utils/common';
import { emptyFunction } from '@utils/common/helpers';

export const waitForSpinnerFinishedWork = async (
  page: Page,
  callback: VoidFunction,
  timeout = 250,
) => {
  const loadingSpinner = page.getByTestId('loading-spinner');

  callback();
  await loadingSpinner.waitFor({ state: 'detached' });
  await waitForRender(page, emptyFunction, timeout);
};
