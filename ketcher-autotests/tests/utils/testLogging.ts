// tests/utils/testLogging.ts
import { test } from '@playwright/test';

/**
 * Логирует предупреждение в консоль и добавляет аннотацию к текущему тесту.
 */
export function logTestWarning(message: string) {
  const testInfo = test.info?.();
  const testName = testInfo?.title || 'unknown test';

  // Показываем в терминале и CI
  console.warn(`[WARNING] [${testName}] ${message}`);

  // Добавляем в Playwright HTML-отчёт
  if (testInfo) {
    testInfo.annotations.push({
      type: 'warning',
      description: message,
    });
  }
}
