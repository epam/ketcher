import type { Ketcher } from 'ketcher-core';
import { Page } from 'playwright/test';

export async function replaceMonomersLibrary(
  page: Page,
  sdfString: string,
): Promise<string | null> {
  return await page.evaluate(async (cmd) => {
    try {
      await (
        globalThis as typeof globalThis & { ketcher: Ketcher }
      ).ketcher.replaceMonomersLibrary(cmd);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return String(error);
    }
  }, sdfString);
}
