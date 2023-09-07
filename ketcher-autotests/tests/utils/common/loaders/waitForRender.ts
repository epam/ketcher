import { Page } from '@playwright/test';

type AnyFunction = (...args: any) => Promise<any>;

export const waitForRender = async (
  page: Page,
  callback: AnyFunction,
  timeout?: number,
) => {
  console.log('started to wait for render');
  await Promise.all([
    waitForCustomEvent(page, 'renderComplete', timeout),
    callback(),
  ]);
  console.log('wait for render is finished');
};

async function waitForCustomEvent(
  page: Page,
  eventName: string,
  timeout?: number,
) {
  return page.evaluate(
    async ({ eventName, timeout }: { eventName: string; timeout?: number }) => {
      return new Promise((resolve) => {
        window.addEventListener(
          eventName,
          () => {
            console.log('finished by event');
            resolve(true);
          },
          { once: true },
        );
        if (timeout) {
          console.log('finished by timeout');
          setTimeout(() => resolve(true), timeout);
        }
      });
    },
    { eventName, timeout },
  );
}
