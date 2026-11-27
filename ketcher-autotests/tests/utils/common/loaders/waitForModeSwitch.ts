import { Page } from '@playwright/test';

export const waitForModeSwitch = async (
  page: Page,
  callback: () => Promise<void>,
  eventName: 'canvasModeSwitchComplete' | 'layoutModeSwitchComplete',
  mode: string,
  ketcherId: string,
  timeout = 30_000,
) => {
  const waiter = await page.evaluateHandle(
    ({ eventName, mode, ketcherId, timeout }) => {
      let finish: (result: boolean) => void;
      let resolved = false;
      const completed = new Promise<boolean>((resolve) => {
        const onComplete = (event: Event) => {
          const { detail } = event as CustomEvent<{
            ketcherId: string;
            mode: string;
          }>;
          if (detail.ketcherId === ketcherId && detail.mode === mode) {
            finish(true);
          }
        };
        const timer = setTimeout(() => finish(false), timeout);
        finish = (result) => {
          if (resolved) {
            return;
          }
          resolved = true;
          clearTimeout(timer);
          globalThis.removeEventListener(eventName, onComplete);
          resolve(result);
        };
        globalThis.addEventListener(eventName, onComplete);
      });
      return { completed, cancel: () => finish(false) };
    },
    { eventName, mode, ketcherId, timeout },
  );

  try {
    await callback();
    if (!(await waiter.evaluate(({ completed }) => completed))) {
      throw new Error(
        `[waitForModeSwitch] Timed out waiting for "${eventName}" in "${mode}" mode for editor "${ketcherId}" after ${timeout}ms.`,
      );
    }
  } finally {
    await waiter.evaluate(({ cancel }) => cancel());
    await waiter.dispose();
  }
};
