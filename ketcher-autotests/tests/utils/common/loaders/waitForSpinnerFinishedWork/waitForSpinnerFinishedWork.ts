import { Page } from '@playwright/test';
import { waitForRender } from '../waitForRender';

export const waitForSpinnerFinishedWork = async (
  page: Page,
  callback: () => Promise<void>,
  timeout = 260,
) => {
  const loadingSpinner = page.getByTestId('loading-spinner');

  await waitForRender(
    page,
    async () => {
      await callback();
      do {
        if ((await loadingSpinner.count()) === 0)
          await page.waitForTimeout(100);
        await loadingSpinner.first().waitFor({ state: 'detached' });
      } while ((await loadingSpinner.count()) > 0);
    },
    timeout,
  );
};
