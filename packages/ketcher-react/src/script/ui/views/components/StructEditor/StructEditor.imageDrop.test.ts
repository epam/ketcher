import PasteTool from '../../../../editor/tool/paste';
import { readImageFile } from '../../../../editor/tool/imageFile';
import StructEditor from './StructEditor';

jest.mock('../../../../editor/tool/imageFile', () => ({
  readImageFile: jest.fn(),
  createStructWithImage: jest.fn((image) => ({ createdFrom: image })),
}));

const readImageFileMock = readImageFile as jest.Mock;

interface FakeDragEvent {
  preventDefault: jest.Mock;
  dataTransfer: {
    types: string[];
    items: Array<{ kind: string; type: string }>;
    files: File[];
    dropEffect: string;
  };
  clientX: number;
  clientY: number;
}

const createEvent = (
  file?: File,
  itemType = file?.type ?? '',
): FakeDragEvent => ({
  preventDefault: jest.fn(),
  dataTransfer: {
    types: file ? ['Files'] : ['text/plain'],
    items: file ? [{ kind: 'file', type: itemType }] : [],
    files: file ? [file] : [],
    dropEffect: '',
  },
  clientX: 30,
  clientY: 40,
});

const createFile = (type: string) => new File(['content'], 'file', { type });

describe('StructEditor image drag and drop', () => {
  let instance: any;
  let editor: any;

  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    readImageFileMock.mockReset();

    instance = new (StructEditor as any)({ ketcherId: 'test' });
    instance.setState = jest.fn();
    editor = {
      render: { options: { microModeScale: 1 } },
      event: { dropImage: { dispatch: jest.fn() } },
      errorHandler: jest.fn(),
      tool: jest.fn(() => null),
    };
    instance.editor = editor;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('highlight', () => {
    it('is shown when an image file enters the canvas', () => {
      const event = createEvent(createFile('image/png'));

      instance.handleDragEnter(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(instance.setState).toHaveBeenCalledWith({ isImageDragOver: true });
    });

    it.each([
      ['text drags', createEvent()],
      ['files that are not images', createEvent(createFile('text/plain'))],
    ])('is not shown for %s', (_name, event) => {
      instance.handleDragEnter(event);

      expect(instance.setState).not.toHaveBeenCalled();
    });

    it('stays visible until the drag has left every nested element', () => {
      const event = createEvent(createFile('image/png'));
      instance.handleDragEnter(event);
      instance.handleDragEnter(event);
      instance.setState.mockClear();

      instance.handleDragLeave(event);
      expect(instance.setState).not.toHaveBeenCalled();

      instance.handleDragLeave(event);
      expect(instance.setState).toHaveBeenCalledWith({
        isImageDragOver: false,
      });
    });

    it('is hidden after a drop', async () => {
      readImageFileMock.mockResolvedValue({});
      await instance.handleDrop(createEvent(createFile('image/png')));

      expect(instance.setState).toHaveBeenCalledWith({
        isImageDragOver: false,
      });
    });
  });

  describe('dragover', () => {
    it('allows copying an image file', () => {
      const event = createEvent(createFile('image/png'));

      instance.handleDragOver(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.dataTransfer.dropEffect).toBe('copy');
    });

    it('cancels the default for other files so the browser does not open them', () => {
      const event = createEvent(createFile('text/plain'));

      instance.handleDragOver(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.dataTransfer.dropEffect).toBe('none');
    });

    it('ignores drags without files', () => {
      const event = createEvent();

      instance.handleDragOver(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('drop', () => {
    it('hands the image over to the paste flow', async () => {
      const file = createFile('image/png');
      const loaded = { src: 'data:', halfSize: {} };
      readImageFileMock.mockResolvedValue(loaded);
      const event = createEvent(file);

      await instance.handleDrop(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(readImageFileMock).toHaveBeenCalledWith(
        file,
        editor.render.options,
      );
      expect(editor.event.dropImage.dispatch).toHaveBeenCalledWith({
        createdFrom: loaded,
      });
      expect(editor.errorHandler).not.toHaveBeenCalled();
    });

    it('moves the paste tool under the drop position', async () => {
      const pasteTool = Object.create(PasteTool.prototype);
      pasteTool.mousemove = jest.fn();
      editor.tool.mockReturnValue(pasteTool);
      readImageFileMock.mockResolvedValue({});

      await instance.handleDrop(createEvent(createFile('image/png')));

      expect(pasteTool.mousemove).toHaveBeenCalledTimes(1);
      const [moveEvent] = pasteTool.mousemove.mock.calls[0];
      expect(moveEvent.clientX).toBe(30);
      expect(moveEvent.clientY).toBe(40);
    });

    it('waits for the paste tool to become active', async () => {
      readImageFileMock.mockResolvedValue({});

      await instance.handleDrop(createEvent(createFile('image/png')));

      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('reports an unusable image and leaves the canvas alone', async () => {
      readImageFileMock.mockRejectedValue(new Error('Unsupported image type'));

      await instance.handleDrop(createEvent(createFile('image/jpeg')));

      expect(editor.errorHandler).toHaveBeenCalledWith(
        'Unsupported image type',
      );
      expect(editor.event.dropImage.dispatch).not.toHaveBeenCalled();
    });

    it('ignores files that are not images without leaving the editor', async () => {
      const event = createEvent(createFile('text/plain'));

      await instance.handleDrop(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(readImageFileMock).not.toHaveBeenCalled();
      expect(editor.event.dropImage.dispatch).not.toHaveBeenCalled();
      expect(editor.errorHandler).not.toHaveBeenCalled();
    });

    it('ignores drops that carry no files', async () => {
      const event = createEvent();

      await instance.handleDrop(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(readImageFileMock).not.toHaveBeenCalled();
    });
  });
});
