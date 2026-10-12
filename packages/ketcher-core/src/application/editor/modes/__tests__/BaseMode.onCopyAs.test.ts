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
  constructor(public items: Record<string, Blob>) {}
}

describe('BaseMode.onCopyAs', () => {
  const writeText = jest.fn();
  const write = jest.fn();
  const convert = jest.fn();
  const generateImage = jest.fn();
  const openErrorModalDispatch = jest.fn();

  const setupEditor = (selectedEntities: unknown[] = [['id', {}]]) => {
    (provideEditorInstance as jest.Mock).mockReturnValue({
      ketcherId: 'ketcher-id',
      drawingEntitiesManager: {
        selectedEntities,
        filterSelection: jest.fn(() => ({})),
      },
      events: { openErrorModal: { dispatch: openErrorModalDispatch } },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    writeText.mockResolvedValue(undefined);
    write.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText, write },
      configurable: true,
    });
    (globalThis as unknown as { ClipboardItem: unknown }).ClipboardItem =
      ClipboardItemMock;
    (ketcherProvider.getKetcher as jest.Mock).mockReturnValue({
      structService: { convert },
      generateImage,
    });
    setupEditor();
  });

  it('copies the selection as KET text', async () => {
    await new TestMode().onCopyAs('ket');

    expect(writeText).toHaveBeenCalledWith('KET_STRING');
    expect(convert).not.toHaveBeenCalled();
    expect(generateImage).not.toHaveBeenCalled();
  });

  it('converts the selection to MOL V3000 with Indigo and copies it', async () => {
    convert.mockResolvedValue({ struct: 'MOL_STRING' });

    await new TestMode().onCopyAs('mol');

    expect(convert).toHaveBeenCalledWith(
      { struct: 'KET_STRING', output_format: ChemicalMimeType.Mol },
      { 'molfile-saving-mode': '3000' },
    );
    expect(writeText).toHaveBeenCalledWith('MOL_STRING');
  });

  it('copies the selection as a PNG image', async () => {
    const image = new Blob(['png'], { type: 'image/png' });
    generateImage.mockResolvedValue(image);

    await new TestMode().onCopyAs('image');

    expect(generateImage).toHaveBeenCalledWith('KET_STRING', {
      outputFormat: 'png',
      backgroundColor: '255, 255, 255',
    });
    expect(write).toHaveBeenCalledTimes(1);
    const [[clipboardItem]] = write.mock.calls[0];
    expect(clipboardItem).toBeInstanceOf(ClipboardItemMock);
    expect(clipboardItem.items['image/png']).toBe(image);
    expect(writeText).not.toHaveBeenCalled();
  });

  it('does nothing when nothing is selected', async () => {
    setupEditor([]);

    await new TestMode().onCopyAs('ket');

    expect(writeText).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    expect(convert).not.toHaveBeenCalled();
  });

  it('shows an error modal and copies nothing when the conversion fails', async () => {
    convert.mockRejectedValue(new Error('Indigo failed'));

    await new TestMode().onCopyAs('mol');

    expect(writeText).not.toHaveBeenCalled();
    expect(openErrorModalDispatch).toHaveBeenCalledWith({
      errorTitle: 'Error Message',
      errorMessage: 'Indigo failed',
    });
  });
});
