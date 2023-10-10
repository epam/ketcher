import { Page } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function emptyFunction() {}
export type AnyFunction = (...args: any) => Promise<any>;

export async function waitForCustomEvent(
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
            resolve(true);
          },
          { once: true },
        );
        if (timeout) {
          setTimeout(() => resolve(true), timeout);
        }
      });
    },
    { eventName, timeout },
  );
}
