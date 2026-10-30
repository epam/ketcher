import { Locator, Page } from '@playwright/test';

/**
 * Returns a locator for the Ketcher canvas rendered in the given editor mode.
 * The canvas exposes its active mode via the `data-canvasmode` attribute
 * (`molecules-mode` / `macromolecules-mode`).
 */
export function getCanvasByMode(
  page: Page,
  mode: 'molecules' | 'macromolecules',
): Locator {
  return page.locator(
    `[data-testid="ketcher-canvas"][data-canvasmode="${mode}-mode"]`,
  );
}
