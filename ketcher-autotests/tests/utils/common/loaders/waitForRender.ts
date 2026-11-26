import { Page } from '@playwright/test';
import { logTestWarning } from '@utils/testLogging';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any) => Promise<any>;

const emptyFunction: AnyFunction = async () => {};
let nextCustomEventWaiterId = 0;

type CustomEventWaiter = {
  received: boolean;
  handler: (event: Event) => void;
  resolve?: (eventReceived: boolean) => void;
  timeoutId?: number;
};

export const waitForRender = async (
  page: Page,
  callback = emptyFunction,
  timeout = 90000,
) => {
  if (timeout === 0) {
    await callback();
    return;
  }

  const eventReceived = await waitForCustomEvent(
    page,
    'renderComplete',
    timeout,
    callback,
  );

  if (!eventReceived) {
    const callbackName = callback.name || 'anonymous';
    logTestWarning(
      `[waitForRender] - callback "${callbackName}" did not receive "renderComplete" event within ${timeout}ms.`,
    );
  }
};

export async function waitForCustomEvent(
  page: Page,
  eventName: string,
  timeout = 1000,
  callback = emptyFunction,
): Promise<boolean> {
  const waiterKey = `__ketcherCustomEventWaiter_${nextCustomEventWaiterId++}`;

  await page.evaluate(
    ({ eventName, waiterKey }) => {
      const waiter: CustomEventWaiter = {
        received: false,
        handler: () => {},
      };

      waiter.handler = () => {
        waiter.received = true;
        waiter.resolve?.(true);
      };

      Object.defineProperty(globalThis, waiterKey, {
        configurable: true,
        value: waiter,
      });
      globalThis.addEventListener(eventName, waiter.handler, { once: true });
    },
    { eventName, waiterKey },
  );

  try {
    await callback();
  } catch (error) {
    if (!page.isClosed()) {
      await page.evaluate(
        ({ eventName, waiterKey }) => {
          const waiter = Reflect.get(globalThis, waiterKey);
          if (
            typeof waiter === 'object' &&
            waiter !== null &&
            'handler' in waiter &&
            typeof waiter.handler === 'function'
          ) {
            globalThis.removeEventListener(eventName, waiter.handler);
          }
          Reflect.deleteProperty(globalThis, waiterKey);
        },
        { eventName, waiterKey },
      );
    }
    throw error;
  }

  return await page.evaluate(
    async ({
      eventName,
      waiterKey,
      timeout,
    }: {
      eventName: string;
      waiterKey: string;
      timeout: number;
    }) => {
      const waiterValue: unknown = Reflect.get(globalThis, waiterKey);
      if (
        typeof waiterValue !== 'object' ||
        waiterValue === null ||
        !('received' in waiterValue) ||
        typeof waiterValue.received !== 'boolean' ||
        !('handler' in waiterValue) ||
        typeof waiterValue.handler !== 'function'
      ) {
        throw new Error('Custom event waiter was not initialized');
      }

      const waiter = waiterValue as CustomEventWaiter;
      const cleanup = () => {
        if (waiter.timeoutId !== undefined) {
          window.clearTimeout(waiter.timeoutId);
        }
        globalThis.removeEventListener(eventName, waiter.handler);
        Reflect.deleteProperty(globalThis, waiterKey);
      };

      if (waiter.received) {
        cleanup();
        return true;
      }

      return new Promise<boolean>((resolve) => {
        waiter.resolve = (eventReceived) => {
          cleanup();
          resolve(eventReceived);
        };

        waiter.timeoutId = window.setTimeout(
          () => waiter.resolve?.(false),
          timeout,
        );
      });
    },
    { eventName, waiterKey, timeout },
  );
}

export const waitForItemsToMergeInitialization = async (
  page: Page,
  callback = emptyFunction,
  timeout = 200,
) => {
  const eventReceived = await waitForCustomEvent(
    page,
    'itemsToMergeInitializationComplete',
    timeout,
    callback,
  );

  if (!eventReceived) {
    logTestWarning(
      `[waitForItemsToMergeInitialization] - event "itemsToMergeInitializationComplete" not received within ${timeout}ms.`,
    );
  }
};
