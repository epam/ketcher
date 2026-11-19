const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PNG_CHUNK_OVERHEAD = 12; // length (4) + type (4) + crc (4)
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const DATA_URI_REGEXP = /^data:([^;,]*)((?:;[^;,]*)*),([\s\S]*)$/;

let crcTable: Uint32Array | undefined;

function getCrcTable(): Uint32Array {
  if (crcTable) {
    return crcTable;
  }
  crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }
  return crcTable;
}

function crc32(bytes: Uint8Array): number {
  const table = getCrcTable();
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function decodeBase64(data: string): Uint8Array | null {
  try {
    const binary = globalThis.atob(data);
    // atob yields one char (0-255) per byte, so every code point is defined
    return Uint8Array.from(binary, (char) => char.codePointAt(0) as number);
  } catch {
    return null;
  }
}

function isPngCorrupted(bytes: Uint8Array): boolean {
  if (
    bytes.length < PNG_SIGNATURE.length ||
    PNG_SIGNATURE.some((value, index) => bytes[index] !== value)
  ) {
    return true;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = PNG_SIGNATURE.length;
  let isFirstChunk = true;

  while (offset + PNG_CHUNK_OVERHEAD <= bytes.length) {
    const dataLength = view.getUint32(offset);
    const chunkEnd = offset + PNG_CHUNK_OVERHEAD + dataLength;
    if (chunkEnd > bytes.length) {
      return true;
    }

    const typeAndData = bytes.subarray(offset + 4, chunkEnd - 4);
    const type = String.fromCodePoint(...typeAndData.subarray(0, 4));
    if (isFirstChunk && type !== 'IHDR') {
      return true;
    }
    if (crc32(typeAndData) !== view.getUint32(chunkEnd - 4)) {
      return true;
    }
    if (type === 'IEND') {
      return false;
    }

    isFirstChunk = false;
    offset = chunkEnd;
  }

  // Ran out of data before the IEND chunk
  return true;
}

function isSvgCorrupted(markup: string): boolean {
  // No DOM (e.g. headless): leave it to the renderer
  if (globalThis.DOMParser === undefined) {
    return false;
  }
  const document = new globalThis.DOMParser().parseFromString(
    markup,
    'image/svg+xml',
  );
  const root = document.documentElement;
  return (
    root?.localName !== 'svg' ||
    root.namespaceURI !== SVG_NAMESPACE ||
    document.getElementsByTagName('parsererror').length > 0
  );
}

function decodeText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Tells whether an image given as a data URI is damaged in a way the browser
 * would hide: browsers decode a PNG with a broken pixel stream as a partial
 * image and fire `load`, so an `error` handler alone cannot detect it.
 *
 * Only PNG and SVG are checked structurally. Any other type is reported as not
 * corrupted and is left to the browser's own `error` event.
 */
export function isImageBitmapCorrupted(bitmap: string): boolean {
  const match = DATA_URI_REGEXP.exec(bitmap);
  if (!match) {
    return false;
  }

  const [, rawMimeType, parameters, payload] = match;
  const mimeType = rawMimeType.trim().toLowerCase();
  const isBase64 = /;base64$/i.test(parameters);

  if (mimeType === 'image/png') {
    const bytes = isBase64 ? decodeBase64(payload) : null;
    return bytes === null || isPngCorrupted(bytes);
  }

  if (mimeType === 'image/svg+xml') {
    let markup: string;
    if (isBase64) {
      const bytes = decodeBase64(payload);
      if (bytes === null) {
        return true;
      }
      markup = decodeText(bytes);
    } else {
      try {
        markup = decodeURIComponent(payload);
      } catch {
        return true;
      }
    }
    return isSvgCorrupted(markup);
  }

  return false;
}
