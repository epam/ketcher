import { Page } from '@playwright/test';
import { getBrowserFilePayload } from './dragFileOnCanvas';

/**
 * Puts an image file on the system clipboard like "Copy image" in a browser
 * does. Chromium accepts only PNG here. Optional text is added as a second
 * clipboard format, like chemistry applications do next to a picture.
 */
export async function putImageOnClipboard(
  page: Page,
  filename: string,
  text?: string,
) {
  const payload = await getBrowserFilePayload(filename);

  await page.bringToFront();
  await page.evaluate(
    async ({ base64, type, clipboardText }) => {
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const items: Record<string, Blob> = {
        [type]: new Blob([bytes], { type }),
      };
      if (clipboardText) {
        items['text/plain'] = new Blob([clipboardText], { type: 'text/plain' });
      }
      await navigator.clipboard.write([new ClipboardItem(items)]);
    },
    { base64: payload.base64, type: payload.type, clipboardText: text },
  );
}

/**
 * Fires a paste event whose clipboard holds the given file, as if the file
 * had been copied in a file manager. Used for file types that cannot be
 * written to the real clipboard from a page (SVG, JPEG).
 */
export async function pasteFileFromClipboardEvent(
  page: Page,
  filename: string,
) {
  const payload = await getBrowserFilePayload(filename);

  await page.evaluate(({ base64, name, type }) => {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const clipboardData = new DataTransfer();
    clipboardData.items.add(new File([bytes], name, { type }));

    const clipArea = document.activeElement?.hasAttribute('data-cliparea')
      ? document.activeElement
      : document.querySelector('[data-cliparea]');
    clipArea?.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, payload);
}
