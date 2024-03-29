import { ChemicalMimeType } from 'domain/services';

/**
 *
 * Legacy browser API doesn't support async operations, so it is not possible
 * to call indigo, when copy/cut/paste
 */
export function isClipboardAPIAvailable() {
  return (
    typeof navigator?.clipboard?.writeText === 'function' &&
    typeof navigator?.clipboard?.read === 'function'
  );
}

export function notifyCopyCut() {
  const event = new Event('copyOrCutComplete');
  window.dispatchEvent(event);
}

export async function getStructStringFromClipboardData(
  data: ClipboardItem[],
): Promise<string> {
  const clipboardItem = data[0];

  if (clipboardItem instanceof ClipboardItem) {
    const structStr =
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.KET}`)) ||
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.Mol}`)) ||
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.Rxn}`)) ||
      (await safelyGetMimeType(clipboardItem, 'text/plain'));
    return structStr === '' ? '' : structStr.text();
  } else {
    return (
      data[ChemicalMimeType.KET] ||
      data[ChemicalMimeType.Mol] ||
      data[ChemicalMimeType.Rxn] ||
      data['text/plain']
    );
  }
}

export async function safelyGetMimeType(
  clipboardItem: ClipboardItem,
  mimeType: string,
) {
  try {
    const result = await clipboardItem.getType(mimeType);
    return result;
  } catch {
    return '';
  }
}
