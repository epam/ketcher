import { Page } from 'playwright/test';

export async function updateMonomersLibrary(
  page: Page,
  sdfString: string,
): Promise<string | null> {
  return page.evaluate(async (cmd) => {
    try {
      await window.ketcher.updateMonomersLibrary(cmd);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return String(error);
    }
  }, sdfString);
}
