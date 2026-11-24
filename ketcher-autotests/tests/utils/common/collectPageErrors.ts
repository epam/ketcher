import { ConsoleMessage, Page } from '@playwright/test';

export function collectPageErrors(page: Page) {
  const errors: string[] = [];
  const onPageError = (error: Error) => errors.push(error.message);
  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text());
  };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);

  return {
    errors,
    stop() {
      page.off('pageerror', onPageError);
      page.off('console', onConsole);
    },
  };
}
