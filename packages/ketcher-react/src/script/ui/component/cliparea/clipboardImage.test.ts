import { getImageFileFromClipboardData } from './clipboardImage';

const createFile = (type: string, name = 'file') =>
  new File(['content'], name, { type });

const createClipboardData = (files: File[], text = '') =>
  ({
    files,
    getData: (format: string) => (format === 'text/plain' ? text : ''),
  }) as unknown as DataTransfer;

describe('getImageFileFromClipboardData', () => {
  it('returns the image file when the clipboard has no text', () => {
    const png = createFile('image/png');

    expect(getImageFileFromClipboardData(createClipboardData([png]))).toBe(png);
  });

  it('returns the first image among other files', () => {
    const molfile = createFile('');
    const svg = createFile('image/svg+xml');

    expect(
      getImageFileFromClipboardData(createClipboardData([molfile, svg])),
    ).toBe(svg);
  });

  it('returns unsupported image files too so that they can be reported', () => {
    const jpeg = createFile('image/jpeg');

    expect(getImageFileFromClipboardData(createClipboardData([jpeg]))).toBe(
      jpeg,
    );
  });

  it('ignores the image when the clipboard also has text', () => {
    const png = createFile('image/png', 'image.png');

    expect(
      getImageFileFromClipboardData(createClipboardData([png], 'C1CCCCC1')),
    ).toBeUndefined();
  });

  it('treats whitespace as no text', () => {
    const png = createFile('image/png');

    expect(
      getImageFileFromClipboardData(createClipboardData([png], '  \n')),
    ).toBe(png);
  });

  it('does not count the file name added by a file manager as text', () => {
    const png = createFile('image/png', 'benzene.png');

    expect(
      getImageFileFromClipboardData(createClipboardData([png], 'benzene.png')),
    ).toBe(png);
  });

  it('returns nothing when there are no image files', () => {
    expect(
      getImageFileFromClipboardData(createClipboardData([createFile('')])),
    ).toBeUndefined();
    expect(
      getImageFileFromClipboardData(createClipboardData([])),
    ).toBeUndefined();
    expect(getImageFileFromClipboardData(null)).toBeUndefined();
    expect(getImageFileFromClipboardData(undefined)).toBeUndefined();
  });
});
