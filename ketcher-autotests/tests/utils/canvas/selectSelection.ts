import { Page } from '@playwright/test';
import { waitForRender } from '../common/loaders/waitForRender';

export async function selectAllStructuresOnCanvas(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  await waitForRender(
    page,
    async () => await page.keyboard.press(`ControlOrMeta+KeyA`, options),
  );
}
