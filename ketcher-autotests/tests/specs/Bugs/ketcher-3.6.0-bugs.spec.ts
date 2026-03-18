import { test, expect } from '@playwright/test';

test.describe('MacromoleculePropertiesWindow events access', () => {
  test('should handle undefined events property without throwing error', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(`${process.env.KETCHER_URL}/duo`);

    await page.waitForLoadState('networkidle');

    try {
      await page.waitForSelector(
        '[data-testid="macromolecule-properties-close"]',
        {
          state: 'attached',
          timeout: 5000,
        },
      );
    } catch (error) {
      console.log(
        'Component not found, but this is expected if there is no selection',
      );
    }

    const WAIT_TIME_MS = 2000;
    await page.waitForTimeout(WAIT_TIME_MS);

    const allErrors = [...consoleErrors, ...pageErrors];

    if (allErrors.length > 0) {
      console.log('All errors caught:', allErrors);
    }

    const editorEventsErrors = allErrors.filter((error) =>
      error.includes("Cannot read properties of undefined (reading 'events')"),
    );

    expect(editorEventsErrors.length).toBe(0);
  });
});
