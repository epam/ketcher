import { Page } from '@playwright/test';
import { logTestWarning } from '@utils/testLogging';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any) => Promise<any>;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyFunction: AnyFunction = async () => {};

export const waitForRender = async (
  page: Page,
  callback = emptyFunction,
  timeout = 250,
) => {
  await callback();

  if (timeout !== 0) {
    const callbackName = callback.name || 'anonymous';

    const eventReceived = await waitForCustomEvent(
      page,
      'renderComplete',
      timeout,
    );

    if (!eventReceived) {
      logTestWarning(
        `[waitForRender] - callback "${callbackName}" did not receive "renderComplete" event within ${timeout}ms.`,
      );
    }
  }
};

export const waitForCustomEvent = async (
  page: Page,
  eventName: string,
  timeout = 1000,
): Promise<boolean> => {
  return page.evaluate(
    ({ eventName, timeout }: { eventName: string; timeout: number }) => {
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
};

export const waitForItemsToMergeInitialization = async (
  page: Page,
  callback = emptyFunction,
  timeout = 200,
) => {
  await callback();

  const eventReceived = await waitForCustomEvent(
    page,
    'itemsToMergeInitializationComplete',
    timeout,
  );

  if (!eventReceived) {
    logTestWarning(
      `[waitForItemsToMergeInitialization] - event "itemsToMergeInitializationComplete" not received within ${timeout}ms.`,
    );
  }
};
