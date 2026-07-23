import { Page } from '@playwright/test';
import { logTestWarning } from '@utils/testLogging';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any) => Promise<any>;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyFunction: AnyFunction = async () => {};

export const waitForCalculateProperties = async (
  page: Page,
  callback = emptyFunction,
  timeout = 1000,
) => {
  await callback();

  if (timeout !== 0) {
    const callbackName = callback.name || 'anonymous';

    const eventReceived = await waitForCustomEvent(
      page,
      'requestCompleted',
      timeout,
    );

    if (!eventReceived) {
      logTestWarning(
        `[waitForCalclateProperties] - callback "${callbackName}" did not receive "renderComplete" event within ${timeout}ms.`,
      );
    }
  }
};

async function waitForCustomEvent(
  page: Page,
  eventName: string,
  timeout = 1000,
): Promise<boolean> {
  return await page.evaluate(
    async ({ eventName, timeout }: { eventName: string; timeout: number }) => {
      return new Promise<boolean>((resolve) => {
        let resolved = false;

        const handler = () => {
          resolved = true;
          resolve(true);
        };

        window.addEventListener(eventName, handler, { once: true });

        setTimeout(() => {
          if (!resolved) resolve(false);
        }, timeout);
      });
    },
    { eventName, timeout },
  );
}
