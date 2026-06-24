import { ChemicalMimeType } from 'domain/services/struct/structService.types';

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

export function legacyCopy(clipboardData, data) {
  let curFmt;
  clipboardData.setData('text/plain', data['text/plain']);
  try {
    Object.keys(data).forEach((fmt) => {
      curFmt = fmt;
      clipboardData.setData(fmt, data[fmt]);
    });
  } catch (e) {
    console.error('clipboardUtils.ts::legacyCopy', e);
    console.info(`Could not write exact type ${curFmt}`);
  }
}

export function legacyPaste(cb, formats) {
  let data = {};
  data['text/plain'] = cb.getData('text/plain');
  data = formats.reduce((res, fmt) => {
    const d = cb.getData(fmt);
    if (d) res[fmt] = d;
    return res;
  }, data);
  return data;
}

export function notifyCopyCut() {
  const event = new Event('copyOrCutComplete');
  window.dispatchEvent(event);
}

export async function getStructStringFromClipboardData(
  data: ClipboardItem[],
): Promise<string> {
  const clipboardItem = data[0];

  if (clipboardItem && clipboardItem instanceof ClipboardItem) {
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

/**
 * Checks whether the system clipboard currently holds any content that can be
 * pasted onto the canvas. Used to enable/disable the "Paste" context-menu item.
 */
export async function isPasteContentAvailable(): Promise<boolean> {
  if (!isClipboardAPIAvailable()) {
    return true;
  }

  try {
    const clipboardData = await navigator.clipboard.read();
    const structStr = await getStructStringFromClipboardData(clipboardData);
    return Boolean(structStr?.trim());
  } catch (error) {
    return error instanceof DOMException && error.name === 'NotAllowedError';
  }
}

export async function safelyGetMimeType(
  clipboardItem: ClipboardItem,
  mimeType: string,
) {
  try {
    const result = await clipboardItem.getType(mimeType);
    return result?.size > 0 ? result : '';
  } catch {
    return '';
  }
}
