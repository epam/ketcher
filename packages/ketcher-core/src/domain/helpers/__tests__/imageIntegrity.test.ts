import { isImageBitmapCorrupted } from '../imageIntegrity';

// 1x1 PNG: signature, IHDR, IDAT, IEND
const VALID_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

const VALID_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>';

function toBase64(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64');
}

function pngBytes(): Buffer {
  return Buffer.from(VALID_PNG_BASE64, 'base64');
}

function pngBitmap(bytes: Buffer): string {
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

describe('isImageBitmapCorrupted', () => {
  describe('PNG', () => {
    it('accepts a valid PNG', () => {
      expect(isImageBitmapCorrupted(pngBitmap(pngBytes()))).toBe(false);
    });

    it('accepts a valid PNG with trailing bytes after IEND', () => {
      const bytes = Buffer.concat([pngBytes(), Buffer.from([0, 0, 0, 0])]);
      expect(isImageBitmapCorrupted(pngBitmap(bytes))).toBe(false);
    });

    it('detects a broken pixel-data chunk (bad CRC)', () => {
      const bytes = pngBytes();
      // Flip a byte inside the IDAT data
      bytes[bytes.length - 20] ^= 0xff;
      expect(isImageBitmapCorrupted(pngBitmap(bytes))).toBe(true);
    });

    it('detects a truncated PNG', () => {
      const bytes = pngBytes().subarray(0, pngBytes().length - 20);
      expect(isImageBitmapCorrupted(pngBitmap(bytes))).toBe(true);
    });

    it('detects a PNG without the IEND chunk', () => {
      const bytes = pngBytes().subarray(0, pngBytes().length - 12);
      expect(isImageBitmapCorrupted(pngBitmap(bytes))).toBe(true);
    });

    it('detects a wrong signature', () => {
      const bytes = pngBytes();
      bytes[1] = 0x00;
      expect(isImageBitmapCorrupted(pngBitmap(bytes))).toBe(true);
    });

    it('detects a first chunk that is not IHDR', () => {
      const bytes = pngBytes();
      bytes[12] = 0x58; // IHDR -> XHDR, which also breaks the CRC
      expect(isImageBitmapCorrupted(pngBitmap(bytes))).toBe(true);
    });

    it('detects an empty payload', () => {
      expect(isImageBitmapCorrupted('data:image/png;base64,')).toBe(true);
    });

    it('detects invalid base64', () => {
      expect(isImageBitmapCorrupted('data:image/png;base64,@@@@')).toBe(true);
    });

    it('detects a PNG that is not base64 encoded', () => {
      expect(isImageBitmapCorrupted('data:image/png,abc')).toBe(true);
    });
  });

  describe('SVG', () => {
    it('accepts a valid base64 SVG', () => {
      expect(
        isImageBitmapCorrupted(
          `data:image/svg+xml;base64,${toBase64(VALID_SVG)}`,
        ),
      ).toBe(false);
    });

    it('accepts a valid percent-encoded SVG', () => {
      expect(
        isImageBitmapCorrupted(
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(VALID_SVG)}`,
        ),
      ).toBe(false);
    });

    it('detects a truncated SVG', () => {
      const truncated = VALID_SVG.slice(0, 60);
      expect(
        isImageBitmapCorrupted(
          `data:image/svg+xml;base64,${toBase64(truncated)}`,
        ),
      ).toBe(true);
    });

    it('detects a document that is not an SVG', () => {
      expect(
        isImageBitmapCorrupted(
          `data:image/svg+xml;base64,${toBase64('<html></html>')}`,
        ),
      ).toBe(true);
    });

    it('detects an SVG without the SVG namespace', () => {
      expect(
        isImageBitmapCorrupted(
          `data:image/svg+xml;base64,${toBase64('<svg width="1"></svg>')}`,
        ),
      ).toBe(true);
    });

    it('detects invalid base64', () => {
      expect(isImageBitmapCorrupted('data:image/svg+xml;base64,@@@@')).toBe(
        true,
      );
    });
  });

  describe('other input', () => {
    it('leaves other image types to the browser', () => {
      expect(isImageBitmapCorrupted('data:image/jpeg;base64,AAAA')).toBe(false);
    });

    it('leaves non data URIs to the browser', () => {
      expect(isImageBitmapCorrupted('https://example.com/a.png')).toBe(false);
    });
  });
});
