import { Page } from 'playwright/test';

export async function updateMonomersLibrary(
  page: Page,
  sdfString: string,
): Promise<string | null> {
  return await page.evaluate(async (cmd) => {
    try {
      await globalThis.window.ketcher.updateMonomersLibrary(cmd, {
        format: 'sdf',
      });
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return String(error);
    }
  }, sdfString);
}

<<<<<<< HEAD
type LogCaptureWindow = typeof window & {
=======
type LogCaptureWindow = typeof globalThis.window & {
>>>>>>> origin/master
  logging?: { enabled?: boolean; level?: number; showTrace?: boolean };
};

/**
 * Updates the monomer library with KetcherLogger enabled and returns the
 * rejection message (if any) together with the errors it logged. Invalid
 * monomers are skipped and only reported through the logger.
 */
export async function updateMonomersLibraryAndGetLoggedErrors(
  page: Page,
  sdfString: string,
): Promise<{ error: string | null; loggedErrors: string }> {
  return await page.evaluate(async (cmd) => {
<<<<<<< HEAD
    const testWindow = window as LogCaptureWindow;
=======
    const testWindow = globalThis.window as LogCaptureWindow;
>>>>>>> origin/master
    const originalLogging = testWindow.logging;
    const originalConsoleError = console.error;
    const loggedErrors: string[] = [];

    testWindow.logging = { enabled: true, level: 0, showTrace: false };
    console.error = (...args) => {
      loggedErrors.push(args.flat().join(' '));
    };

    let error: string | null = null;
    try {
<<<<<<< HEAD
      await window.ketcher.updateMonomersLibrary(cmd, { format: 'sdf' });
=======
      await testWindow.ketcher.updateMonomersLibrary(cmd, { format: 'sdf' });
>>>>>>> origin/master
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      console.error = originalConsoleError;
      testWindow.logging = originalLogging;
    }

    return { error, loggedErrors: loggedErrors.join('\n') };
  }, sdfString);
}
