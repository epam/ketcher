import { ketcherProvider } from 'ketcher-core';
import { initClipboard } from './hotkeys';
import { readImageFile } from '../../editor/tool/imageFile';
import PasteTool from '../../editor/tool/paste';

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
    render: {
      options: typeof options;
      clientArea: { getBoundingClientRect: () => Record<string, number> };
    };
    lastCursorPosition: { x: number; y: number };
    tool: jest.Mock;
    errorHandler: jest.Mock;
  };
  let pasteTool: { mousemove: jest.Mock };
  let eventBus: { emit: jest.Mock };
  let clipboard: ReturnType<typeof initClipboard>;

  const pasteImage = () =>
    clipboard.onPasteImage(
      new File(['content'], 'image.png', { type: 'image/png' }),
    );

  beforeEach(() => {
    readImageFileMock.mockReset();
    dispatch = jest.fn();
    pasteTool = Object.create(PasteTool.prototype);
    pasteTool.mousemove = jest.fn();
    editor = {
      ketcherId: 'test',
      render: {
        options,
        clientArea: {
          getBoundingClientRect: () => ({
            x: 100,
            y: 50,
            width: 800,
            height: 600,
          }),
        },
      },
      lastCursorPosition: { x: 200, y: 120 },
      tool: jest.fn(() => pasteTool),
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
    expect(pasteTool.mousemove).not.toHaveBeenCalled();
  });

  it('keeps the async event lifecycle of the other paste handlers', async () => {
    readImageFileMock.mockResolvedValue(loadedImage);

    await pasteImage();

    expect(eventBus.emit).toHaveBeenCalledTimes(2);
  });

  describe('pointer position', () => {
    beforeEach(() => {
      readImageFileMock.mockResolvedValue(loadedImage);
    });

    it('puts the pasted image under the pointer so that a click places it there', async () => {
      await pasteImage();

      expect(pasteTool.mousemove).toHaveBeenCalledTimes(1);
      const [moveEvent] = pasteTool.mousemove.mock.calls[0];
      expect(moveEvent.clientX).toBe(300);
      expect(moveEvent.clientY).toBe(170);
    });

    it('keeps the canvas center when the pointer has not moved over the canvas yet', async () => {
      editor.lastCursorPosition = { x: 0, y: 0 };

      await pasteImage();

      expect(pasteTool.mousemove).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalled();
    });

    it('keeps the canvas center when the pointer is outside the canvas', async () => {
      editor.lastCursorPosition = { x: 900, y: 120 };

      await pasteImage();

      expect(pasteTool.mousemove).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalled();
    });
  });
});
