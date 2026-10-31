import { expect, Locator, Page } from '@playwright/test';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

const PASTE_PREVIEW_APPEAR_TIMEOUT = 5000;

/**
 * In Flex mode, Paste and Add to Canvas show a ghost that follows the cursor
 * until the user clicks. The ghost can appear asynchronously (clipboard read,
 * Indigo conversion), so wait for it instead of checking visibility once.
 * Other modes add the structure immediately, so nothing is done there.
 */
export async function commitPastePreviewInFlexMode(
  page: Page,
  commit: (preview: Locator) => Promise<void>,
) {
  // The collapsed layout mode dropdown shows only the active mode button.
  const isFlexMode = await page
    .getByTestId(LayoutMode.Flex)
    .first()
    .isVisible();
  if (!isFlexMode) {
    return;
  }

  const preview = page.getByTestId('paste-preview');
  try {
    await preview.waitFor({
      state: 'visible',
      timeout: PASTE_PREVIEW_APPEAR_TIMEOUT,
    });
  } catch {
    // Nothing to place, e.g. empty clipboard or a rejected structure.
    return;
  }

  await commit(preview);
  await expect(preview).toHaveCount(0);
}
