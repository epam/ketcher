import { Page, test } from '@playwright/test';

type AnyFunction = (...args: any) => Promise<any>;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyFunction: AnyFunction = async () => {};

export const waitForRender = async (
  page: Page,
  callback = emptyFunction,
  timeout = 1000,
) => {
  await callback();

  if (timeout !== 0) {
    const testName = test.info().title;
    const callbackName = callback.name || 'anonymous';

    await waitForCustomEvent(
      page,
      'renderComplete',
      timeout,
      testName,
      `waitForRender → ${callbackName}`,
    );
  }
};

async function waitForCustomEvent(
  page: Page,
  eventName: string,
  timeout?: number,
  testName?: string,
  functionName?: string,
) {
  return page.evaluate(
    ({
      eventName,
      timeout,
      testName,
      functionName,
    }: {
      eventName: string;
      timeout?: number;
      testName?: string;
      functionName?: string;
    }) => {
      return new Promise<boolean>((resolve) => {
        let resolved = false;

        const handler = () => {
          resolved = true;
          resolve(true);
        };

        window.addEventListener(eventName, handler, { once: true });

        if (timeout) {
          setTimeout(() => {
            if (!resolved) {
              console.warn(
                `[waitForCustomEvent] Test "${
                  testName ?? 'unknown'
                }", function "${
                  functionName ?? 'unknown'
                }" — did not receive event "${eventName}" within ${timeout}ms.`,
              );
              resolve(false);
            }
          }, timeout);
        }
      });
    },
    { eventName, timeout, testName, functionName },
  );
}

export const waitForItemsToMergeInitialization = async (
  page: Page,
  callback = emptyFunction,
  timeout = 200,
) => {
  const testName = test.info().title;

  const waitForEvent = waitForCustomEvent(
    page,
    'itemsToMergeInitializationComplete',
    timeout,
    testName,
    'waitForItemsToMergeInitialization',
  );

  await callback();
  await waitForEvent;
};
