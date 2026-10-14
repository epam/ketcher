import { isFileDrag, isImageFileDrag } from './helpers';

const createDataTransfer = (
  types: string[],
  items: Array<{ kind: string; type: string }> = [],
) => ({ types, items }) as unknown as DataTransfer;

describe('isFileDrag', () => {
  it('is true when files are dragged', () => {
    expect(isFileDrag(createDataTransfer(['Files']))).toBe(true);
  });

  it('is false for text drags and a missing data transfer', () => {
    expect(isFileDrag(createDataTransfer(['text/plain']))).toBe(false);
    expect(isFileDrag(null)).toBe(false);
  });
});

describe('isImageFileDrag', () => {
  it('is true for an image file', () => {
    expect(
      isImageFileDrag(
        createDataTransfer(['Files'], [{ kind: 'file', type: 'image/png' }]),
      ),
    ).toBe(true);
  });

  it('is true when the browser hides the file type', () => {
    expect(
      isImageFileDrag(
        createDataTransfer(['Files'], [{ kind: 'file', type: '' }]),
      ),
    ).toBe(true);
    expect(isImageFileDrag(createDataTransfer(['Files']))).toBe(true);
  });

  it('is false for a file that is not an image', () => {
    expect(
      isImageFileDrag(
        createDataTransfer(['Files'], [{ kind: 'file', type: 'text/plain' }]),
      ),
    ).toBe(false);
  });

  it('is false when no files are dragged', () => {
    expect(isImageFileDrag(createDataTransfer(['text/plain']))).toBe(false);
  });
});
