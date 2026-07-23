// tests/utils/testLogging.ts
import { test } from '@playwright/test';

/**
 * Logs a warning to the console and adds an annotation to the current test.
 */
export function logTestWarning(message: string) {
  if (process.env.ENABLE_CUSTOM_WARNINGS === 'true') {
    const testInfo = test.info?.();
    const testName = testInfo?.title || 'unknown test';
    console.warn(`[WARNING] [${testName}] ${message}`);

    if (testInfo) {
      testInfo.annotations.push({
        type: 'warning',
        description: message,
      });
    }
  }
}
