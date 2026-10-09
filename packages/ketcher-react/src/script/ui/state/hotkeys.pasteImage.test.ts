import { ketcherProvider } from 'ketcher-core';
import { initClipboard } from './hotkeys';
import { readImageFile } from '../../editor/tool/imageFile';

jest.mock('../../editor/tool/imageFile', () => ({
  readImageFile: jest.fn(),
  createStructWithImage: jest.fn((image) => ({ createdFrom: image })),
}));

const readImageFileMock = readImageFile as jest.Mock;

describe('initClipboard onPasteImage', () => {
  const options = { microModeScale: 1 };
  const loadedImage = { src: 'data:image/png;base64,AAAA', halfSize: {} };
  let dispatch: jest.Mock;
  let editor: {
    ketcherId: string;
    render: { options: typeof options };
    errorHandler: jest.Mock;
  };
  let eventBus: { emit: jest.Mock };
  let clipboard: ReturnType<typeof initClipboard>;

  beforeEach(() => {
    readImageFileMock.mockReset();
    dispatch = jest.fn();
    editor = {
      ketcherId: 'test',
      render: { options },
      errorHandler: jest.fn(),
    };
    eventBus = { emit: jest.fn() };
    jest
      .spyOn(ketcherProvider, 'getKetcher')
      .mockReturnValue({ eventBus } as never);

    clipboard = initClipboard(dispatch, () => ({ editor }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts the paste tool with a structure that holds the image', async () => {
    readImageFileMock.mockResolvedValue(loadedImage);
    const file = new File(['content'], 'image.png', { type: 'image/png' });

    await clipboard.onPasteImage(file);

    expect(readImageFileMock).toHaveBeenCalledWith(file, options);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'ACTION',
      action: { tool: 'paste', opts: { createdFrom: loadedImage } },
    });
    expect(editor.errorHandler).not.toHaveBeenCalled();
  });

  it('reports an unusable image and does not start the paste tool', async () => {
    readImageFileMock.mockRejectedValue(new Error('Unsupported image type'));

    await clipboard.onPasteImage(
      new File(['content'], 'image.jpg', { type: 'image/jpeg' }),
    );

    expect(editor.errorHandler).toHaveBeenCalledWith('Unsupported image type');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('keeps the async event lifecycle of the other paste handlers', async () => {
    readImageFileMock.mockResolvedValue(loadedImage);

    await clipboard.onPasteImage(
      new File(['c'], 'i.png', { type: 'image/png' }),
    );

    expect(eventBus.emit).toHaveBeenCalledTimes(2);
  });
});
