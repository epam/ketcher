import { type Mock } from 'vitest';
import { BaseMode } from 'application/editor/modes/BaseMode';
import { Command } from 'domain/entities/Command';
import { Vec2 } from 'domain/entities';
import { provideEditorInstance } from '../../editorSingleton';
import { ketcherProvider } from 'application/ketcherProvider';
import type { LayoutMode } from 'application/editor/modes/types';
import { KetcherLogger } from 'utilities';

vi.mock('../../editorSingleton', () => ({
  provideEditorInstance: vi.fn(),
}));

vi.mock('application/ketcherProvider', () => ({
  ketcherProvider: { getKetcher: vi.fn() },
}));

vi.mock('domain/serializers/ket/ketSerializer', () => ({
  KetSerializer: class {
    serialize = vi.fn(() => 'KET_STRING');
  },
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
  const write = vi.fn();
  const writeText = vi.fn();
  const read = vi.fn();
  const convert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    write.mockResolvedValue(undefined);
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { write, writeText, read },
      configurable: true,
    });
    (ketcherProvider.getKetcher as Mock).mockReturnValue({
      indigo: { convert },
    });
    (provideEditorInstance as Mock).mockReturnValue({
      ketcherId: 'ketcher-id',
      drawingEntitiesManager: {
        hasDrawingEntities: true,
        filterSelection: vi.fn(() => ({
          monomers: new Map([[0, {}]]),
          validateIfApplicableForFasta: vi.fn(() => true),
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

  it('notifies only after clipboard writing completes', async () => {
    let finishWrite = () => {};
    writeText.mockReturnValue(
      new Promise<void>((resolve) => {
        finishWrite = resolve;
      }),
    );
    const listener = vi.fn();
    globalThis.addEventListener('copyOrCutComplete', listener);
    try {
      new TestMode('flex-layout-mode').onCopy();
      expect(listener).not.toHaveBeenCalled();
      finishWrite();
      await vi.waitFor(() => expect(listener).toHaveBeenCalledOnce());
    } finally {
      globalThis.removeEventListener('copyOrCutComplete', listener);
    }
  });

  it('does not notify when clipboard writing fails', async () => {
    const error = new Error('clipboard unavailable');
    writeText.mockRejectedValue(error);
    const logError = vi
      .spyOn(KetcherLogger, 'error')
      .mockImplementation(() => {});
    const listener = vi.fn();
    globalThis.addEventListener('copyOrCutComplete', listener);
    try {
      new TestMode('flex-layout-mode').onCopy();
      await vi.waitFor(() =>
        expect(logError).toHaveBeenCalledWith('BaseMode.ts::onCopy', error),
      );
      expect(listener).not.toHaveBeenCalled();
    } finally {
      globalThis.removeEventListener('copyOrCutComplete', listener);
      logError.mockRestore();
    }
  });

  it('notifies only after clipboard pasting completes', async () => {
    let finishPaste = () => {};
    const paste = new Promise<void>((resolve) => {
      finishPaste = resolve;
    });
    read.mockResolvedValue([]);
    const mode = new TestMode('flex-layout-mode');
    vi.spyOn(mode, 'pasteFromClipboard').mockReturnValue(paste);
    const listener = vi.fn();
    globalThis.addEventListener('pasteComplete', listener);
    try {
      await mode.onPaste();
      expect(listener).not.toHaveBeenCalled();
      finishPaste();
      await vi.waitFor(() => expect(listener).toHaveBeenCalledOnce());
    } finally {
      globalThis.removeEventListener('pasteComplete', listener);
    }
  });
});
