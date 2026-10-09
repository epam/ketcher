import { Vec2 } from 'ketcher-core';
import {
  createStructWithImage,
  isSupportedImageType,
  readImageFile,
} from './imageFile';

const scaleOptions = { microModeScale: 2, macroModeScale: 1 };
const DATA_URL = `data:image/png;base64,${'A'.repeat(400)}`;

interface FakeImageConfig {
  width: number;
  height: number;
  fail: boolean;
}

const createFile = (type: string) =>
  new File(['content'], 'image', { type }) as File;

describe('imageFile', () => {
  const originalImage = window.Image;
  const originalReadAsDataURL = FileReader.prototype.readAsDataURL;
  let config: FakeImageConfig;

  beforeEach(() => {
    config = { width: 100, height: 60, fail: false };

    class FakeImage {
      onload: (() => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      width = 0;
      height = 0;
      private _src = '';

      get src() {
        return this._src;
      }

      set src(value: string) {
        this._src = value;
        setTimeout(() => {
          if (config.fail) {
            this.onerror?.(new Event('error'));
            return;
          }
          this.width = config.width;
          this.height = config.height;
          this.onload?.();
        });
      }
    }

    window.Image = FakeImage as unknown as typeof window.Image;
    FileReader.prototype.readAsDataURL = function () {
      Object.defineProperty(this, 'result', { value: DATA_URL });
      setTimeout(() => this.dispatchEvent(new Event('load')));
    };
  });

  afterEach(() => {
    window.Image = originalImage;
    FileReader.prototype.readAsDataURL = originalReadAsDataURL;
  });

  it('supports only PNG and SVG', () => {
    expect(isSupportedImageType('image/png')).toBe(true);
    expect(isSupportedImageType('image/svg+xml')).toBe(true);
    expect(isSupportedImageType('image/jpeg')).toBe(false);
    expect(isSupportedImageType('')).toBe(false);
  });

  it('rejects an unsupported image type', async () => {
    await expect(
      readImageFile(createFile('image/jpeg'), scaleOptions),
    ).rejects.toThrow('Unsupported image type');
  });

  it('rejects a file without a type', async () => {
    await expect(readImageFile(createFile(''), scaleOptions)).rejects.toThrow(
      'Unsupported image type',
    );
  });

  it('rejects an image smaller than 16x16 pixels', async () => {
    config.width = 15;
    await expect(
      readImageFile(createFile('image/png'), scaleOptions),
    ).rejects.toThrow('Image should be at least 16x16 pixels');
  });

  it('rejects an image that cannot be decoded', async () => {
    config.fail = true;
    await expect(
      readImageFile(createFile('image/png'), scaleOptions),
    ).rejects.toThrow('Cannot load image');
  });

  it('returns the data url and the half size scaled to model units', async () => {
    const result = await readImageFile(createFile('image/png'), scaleOptions);

    expect(result.src).toBe(DATA_URL);
    expect(result.halfSize).toEqual(new Vec2(25, 15));
  });

  it('accepts a sizeless svg with enough content', async () => {
    config.width = 0;
    config.height = 0;
    const result = await readImageFile(
      createFile('image/svg+xml'),
      scaleOptions,
    );

    expect(result.halfSize).toEqual(new Vec2(8, 8));
  });

  it('creates a struct with a single image', async () => {
    const loaded = await readImageFile(createFile('image/png'), scaleOptions);
    const struct = createStructWithImage(loaded);

    expect(struct.images.size).toBe(1);
    expect(struct.images.get(0)?.bitmap).toBe(DATA_URL);
  });
});
