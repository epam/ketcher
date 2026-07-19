import { ChemicalMimeType } from 'domain/services/struct/structService.types';

type LegacyClipboardData = Partial<
  Record<ChemicalMimeType | 'text/plain', string>
>;

export type ClipboardData = ClipboardItem[] | LegacyClipboardData;

const clipboardDataTypes = [
  ChemicalMimeType.KET,
  ChemicalMimeType.Mol,
  ChemicalMimeType.Rxn,
  'text/plain',
] as const;

/**
 *
 * Legacy browser API doesn't support async operations, so it is not possible
 * to call indigo, when copy/cut/paste
 */
export function isClipboardAPIAvailable(): boolean {
  return (
    typeof navigator?.clipboard?.writeText === 'function' &&
    typeof navigator?.clipboard?.read === 'function'
  );
}

export function legacyCopy(
  clipboardData: DataTransfer | null,
  data: Record<string, string>,
): void {
  if (!clipboardData) return;
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

export function legacyPaste(
  cb: DataTransfer | null,
  formats: string[],
): ClipboardData {
  let data: LegacyClipboardData = {};
  if (!cb) return data;
  data['text/plain'] = cb.getData('text/plain');
  data = formats.reduce((res, fmt) => {
    const d = cb.getData(fmt);
    if (d) res[fmt as ChemicalMimeType | 'text/plain'] = d;
    return res;
  }, data);
  return data;
}

export function notifyCopyCut() {
  const event = new Event('copyOrCutComplete');
  window.dispatchEvent(event);
}

export async function getStructStringFromClipboardData(
  data: ClipboardData,
): Promise<string> {
  const clipboardItem = Array.isArray(data) ? data[0] : undefined;

  if (
    clipboardItem &&
    typeof ClipboardItem !== 'undefined' &&
    clipboardItem instanceof ClipboardItem
  ) {
    const structStr =
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.KET}`)) ||
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.Mol}`)) ||
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.Rxn}`)) ||
      (await safelyGetMimeType(clipboardItem, 'text/plain'));
    return structStr === '' ? '' : structStr.text();
  } else {
    if (Array.isArray(data)) {
      return '';
    }

    for (const clipboardDataType of clipboardDataTypes) {
      const structStr = data[clipboardDataType];
      if (structStr) {
        return structStr;
      }
    }

    return '';
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
): Promise<Blob | ''> {
  try {
    const result = await clipboardItem.getType(mimeType);
    return result?.size > 0 ? result : '';
  } catch {
    return '';
  }
}
