import { BaseMode } from 'application/editor/modes/BaseMode';
import { Command } from 'domain/entities/Command';
import { Vec2 } from 'domain/entities';
import { ChemicalMimeType } from 'domain/services/struct/structService.types';
import { provideEditorInstance } from '../../editorSingleton';
import { ketcherProvider } from 'application/ketcherProvider';

jest.mock('../../editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));

jest.mock('application/ketcherProvider', () => ({
  ketcherProvider: { getKetcher: jest.fn() },
}));

jest.mock('domain/serializers/ket/ketSerializer', () => ({
  KetSerializer: jest.fn().mockImplementation(() => ({
    serialize: jest.fn(() => 'KET_STRING'),
  })),
}));

class TestMode extends BaseMode {
  constructor() {
    super('flex-layout-mode');
  }

  getNewNodePosition() {
    return new Vec2(0, 0);
  }

  applyAdditionalPasteOperations() {
    return new Command();
  }

  isPasteAllowedByMode() {
    return true;
  }

  isPasteAvailable() {
    return true;
  }

  scrollForView() {
    // not needed in these tests
  }
}

class ClipboardItemMock {
  constructor(public items: Record<string, Blob | Promise<Blob>>) {}
}

const KET_MIME_TYPE = `web ${ChemicalMimeType.KET}`;
const PLAIN_TEXT_MIME_TYPE = 'text/plain';

// jsdom 16 has no Blob.text(), so read the blob with FileReader
const readBlob = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(blob);
  });

describe('BaseMode.onCopy', () => {
  const write = jest.fn();
  const writeText = jest.fn();
  const read = jest.fn();
  const convert = jest.fn();
  const validateIfApplicableForFasta = jest.fn();

  const setupSelection = (monomerCount: number) => {
    (provideEditorInstance as jest.Mock).mockReturnValue({
      ketcherId: 'ketcher-id',
      drawingEntitiesManager: {
        filterSelection: jest.fn(() => ({
          monomers: new Map(
            Array.from({ length: monomerCount }, (_, index) => [index, {}]),
          ),
          validateIfApplicableForFasta,
        })),
      },
    });
  };

  const getWrittenClipboardItem = (): ClipboardItemMock =>
    write.mock.calls[0][0][0];

  const readClipboardType = async (mimeType: string) =>
    readBlob(await getWrittenClipboardItem().items[mimeType]);

  beforeEach(() => {
    jest.clearAllMocks();
    write.mockResolvedValue(undefined);
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { write, writeText, read },
      configurable: true,
    });
    (globalThis as unknown as { ClipboardItem: unknown }).ClipboardItem =
      ClipboardItemMock;
    (ketcherProvider.getKetcher as jest.Mock).mockReturnValue({
      indigo: { convert },
    });
    validateIfApplicableForFasta.mockReturnValue(true);
    setupSelection(2);
  });

  it('puts KET and the plain-text sequence on the clipboard', async () => {
    convert.mockResolvedValue({ struct: 'AC' });

    new TestMode().onCopy();

    expect(convert).toHaveBeenCalledWith('KET_STRING', {
      outputFormat: ChemicalMimeType.SEQUENCE,
    });
    expect(await readClipboardType(KET_MIME_TYPE)).toBe('KET_STRING');
    expect(await readClipboardType(PLAIN_TEXT_MIME_TYPE)).toBe('AC');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('puts KET as plain text when the selection is not sequence-compatible', async () => {
    validateIfApplicableForFasta.mockReturnValue(false);

    new TestMode().onCopy();

    expect(convert).not.toHaveBeenCalled();
    expect(await readClipboardType(KET_MIME_TYPE)).toBe('KET_STRING');
    expect(await readClipboardType(PLAIN_TEXT_MIME_TYPE)).toBe('KET_STRING');
  });

  it('puts KET as plain text when no monomers are selected', async () => {
    setupSelection(0);

    new TestMode().onCopy();

    expect(convert).not.toHaveBeenCalled();
    expect(await readClipboardType(PLAIN_TEXT_MIME_TYPE)).toBe('KET_STRING');
  });

  it('puts KET as plain text when the Indigo conversion fails', async () => {
    convert.mockRejectedValue(new Error('Indigo failed'));

    new TestMode().onCopy();

    expect(await readClipboardType(KET_MIME_TYPE)).toBe('KET_STRING');
    expect(await readClipboardType(PLAIN_TEXT_MIME_TYPE)).toBe('KET_STRING');
  });

  it('falls back to writeText with KET when ClipboardItem is not supported', () => {
    (globalThis as unknown as { ClipboardItem: unknown }).ClipboardItem =
      jest.fn(() => {
        throw new TypeError('Unsupported clipboard type');
      });

    new TestMode().onCopy();

    expect(write).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith('KET_STRING');
  });
});
