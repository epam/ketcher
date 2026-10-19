import { BaseMode } from 'application/editor/modes/BaseMode';
import { Command } from 'domain/entities/Command';
import { Vec2 } from 'domain/entities';
import { provideEditorInstance } from '../../editorSingleton';
import { ketcherProvider } from 'application/ketcherProvider';
import type { LayoutMode } from 'application/editor/modes/types';

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
  constructor(modeName: LayoutMode) {
    super(modeName);
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

describe('BaseMode.onCopy', () => {
  const write = jest.fn();
  const writeText = jest.fn();
  const read = jest.fn();
  const convert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    write.mockResolvedValue(undefined);
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { write, writeText, read },
      configurable: true,
    });
    (ketcherProvider.getKetcher as jest.Mock).mockReturnValue({
      indigo: { convert },
    });
    (provideEditorInstance as jest.Mock).mockReturnValue({
      ketcherId: 'ketcher-id',
      drawingEntitiesManager: {
        filterSelection: jest.fn(() => ({
          monomers: new Map([[0, {}]]),
          validateIfApplicableForFasta: jest.fn(() => true),
        })),
      },
    });
  });

  it.each<LayoutMode>(['flex-layout-mode', 'snake-layout-mode'])(
    'puts only KET as plain text on the clipboard in %s',
    (modeName) => {
      new TestMode(modeName).onCopy();

      expect(writeText).toHaveBeenCalledWith('KET_STRING');
      expect(write).not.toHaveBeenCalled();
      expect(convert).not.toHaveBeenCalled();
    },
  );
});
