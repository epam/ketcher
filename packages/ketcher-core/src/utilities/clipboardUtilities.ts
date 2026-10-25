import { ChemicalMimeType } from 'domain/services/struct/structService.types';

type ClipboardTransferData =
  Pick<DataTransfer, 'getData' | 'setData'> | null | undefined;

export const PLAIN_TEXT_MIME_TYPE = 'text/plain';

// Prefer exact KET data, then common structure formats, and use plain text last as a fallback.
const clipboardDataTypes = [
  ChemicalMimeType.KET,
  ChemicalMimeType.Mol,
  ChemicalMimeType.Rxn,
  PLAIN_TEXT_MIME_TYPE,
] as const;

type ClipboardDataType = (typeof clipboardDataTypes)[number];

export type ModernClipboardData = ClipboardItem[];
export type LegacyClipboardData = Partial<Record<ClipboardDataType, string>>;

export type ClipboardData = ModernClipboardData | LegacyClipboardData;

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
  clipboardData: ClipboardTransferData,
  data: LegacyClipboardData,
): void {
  if (!clipboardData) {
    return;
  }

  let currentFmt: string | null = null;
  clipboardData.setData(PLAIN_TEXT_MIME_TYPE, data[PLAIN_TEXT_MIME_TYPE] || '');
  try {
    Object.entries(data).forEach(([fmt, value]) => {
      currentFmt = fmt;
      if (typeof value === 'string') {
        clipboardData.setData(fmt, value);
      }
    });
  } catch (error) {
    console.error('clipboardUtils.ts::legacyCopy', error);
    console.info(`Could not write exact type ${currentFmt}`);
  }
}

export function legacyPaste(
  callback: ClipboardTransferData,
  formats: ClipboardDataType[],
): LegacyClipboardData {
  const data: LegacyClipboardData = { [PLAIN_TEXT_MIME_TYPE]: '' };

  if (!callback) {
    return data;
  }

  data[PLAIN_TEXT_MIME_TYPE] = callback.getData(PLAIN_TEXT_MIME_TYPE);
  return formats.reduce<LegacyClipboardData>((result, fmt) => {
    const d = callback.getData(fmt);
    if (d) result[fmt] = d;
    return result;
  }, data);
}

export function notifyCopyCut() {
  const event = new Event('copyOrCutComplete');
  window.dispatchEvent(event);
}

function hasClipboardItemAPI(item?: ClipboardItem): item is ClipboardItem {
  return Boolean(item && typeof item.getType === 'function');
}

export async function getStructStringFromClipboardData(
  data: ClipboardData,
): Promise<string> {
  if (Array.isArray(data)) {
    const clipboardItem = data[0];

    if (!hasClipboardItemAPI(clipboardItem)) {
      return '';
    }

    for (const clipboardDataType of clipboardDataTypes) {
      const mimeType =
        clipboardDataType === PLAIN_TEXT_MIME_TYPE
          ? clipboardDataType
          : `web ${clipboardDataType}`;
      const structString = await safelyGetMimeType(clipboardItem, mimeType);
      if (structString) {
        return structString.text();
      }
    }

    return '';
  }

  for (const clipboardDataType of clipboardDataTypes) {
    const structString = data[clipboardDataType];
    if (structString) {
      return structString;
    }
  }

  return '';
}

/**
 * Checks whether the system clipboard currently holds any content that can be
 * pasted onto the canvas. Used to enable/disable the "Paste" context-menu item.
 */
export async function isPasteContentAvailable(
  validateContent: (content: string) => Promise<boolean>,
): Promise<boolean> {
  if (!isClipboardAPIAvailable()) {
    return true;
  }

  try {
    const clipboardData = await navigator.clipboard.read();
    const structString = await getStructStringFromClipboardData(clipboardData);
    return structString?.trim() ? validateContent(structString) : false;
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
