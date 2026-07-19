import { ChemicalMimeType } from 'domain/services/struct/structService.types';

export const PLAIN_TEXT_MIME_TYPE = 'text/plain';

type ClipboardDataType = ChemicalMimeType | typeof PLAIN_TEXT_MIME_TYPE;

type LegacyClipboardData = Partial<Record<ClipboardDataType, string>>;

export type ClipboardData = ClipboardItem[] | LegacyClipboardData;

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
  data: LegacyClipboardData,
): void {
  // ClipboardEvent.clipboardData can be null in non-standard or synthetic events.
  if (!clipboardData) return;
  let curFmt;
  const plainTextData = data[PLAIN_TEXT_MIME_TYPE] || '';
  clipboardData.setData(PLAIN_TEXT_MIME_TYPE, plainTextData);
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
  formats: ClipboardDataType[],
): LegacyClipboardData {
  let data: LegacyClipboardData = {};
  if (!cb) return data;
  data[PLAIN_TEXT_MIME_TYPE] = cb.getData(PLAIN_TEXT_MIME_TYPE);
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

// Prefer exact KET data, then common structure formats, and use plain text last as a fallback.
const clipboardDataTypes = [
  ChemicalMimeType.KET,
  ChemicalMimeType.Mol,
  ChemicalMimeType.Rxn,
  PLAIN_TEXT_MIME_TYPE,
] as const;

function isValidClipboardItem(item?: ClipboardItem): item is ClipboardItem {
  return typeof ClipboardItem !== 'undefined' && item instanceof ClipboardItem;
}

export async function getStructStringFromClipboardData(
  data: ClipboardData,
): Promise<string> {
  if (Array.isArray(data)) {
    const clipboardItem = data[0];

    if (!isValidClipboardItem(clipboardItem)) {
      return '';
    }

    const structStr =
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.KET}`)) ||
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.Mol}`)) ||
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.Rxn}`)) ||
      (await safelyGetMimeType(clipboardItem, PLAIN_TEXT_MIME_TYPE));
    return structStr === '' ? '' : structStr.text();
  }

  for (const clipboardDataType of clipboardDataTypes) {
    const structStr = data[clipboardDataType];
    if (structStr) {
      return structStr;
    }
  }

  return '';
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
