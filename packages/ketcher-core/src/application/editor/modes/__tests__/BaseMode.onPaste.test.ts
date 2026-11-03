import { mockDeep } from 'jest-mock-extended';
import type { CoreEditor } from '../../Editor';
import { BaseMode } from '../BaseMode';
import { Command } from 'domain/entities/Command';
import { Vec2 } from 'domain/entities/vec2';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import { provideEditorInstance } from '../../editorSingleton';
import type { LayoutMode } from '../types';
import { KetcherLogger } from 'utilities';
import { ketcherProvider } from 'application/ketcherProvider';
import { SequenceType } from 'domain/entities/monomer-chains/types';
import { ChemicalMimeType } from 'domain/services/struct/structService.types';

jest.mock('../../editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));
jest.mock('domain/serializers/ket/ketSerializer', () => ({
  KetSerializer: jest.fn(),
}));
jest.mock('application/ketcherProvider', () => ({
  ketcherProvider: { getKetcher: jest.fn() },
}));

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

class TestMode extends BaseMode {
  constructor(modeName: LayoutMode) {
    super(modeName);
  }
  getNewNodePosition() {
    return new Vec2();
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
    // No scrolling is needed by this test mode.
  }
}

describe('BaseMode paste routing', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each<LayoutMode>([
    'flex-layout-mode',
    'snake-layout-mode',
    'sequence-layout-mode',
  ])(
    'only defers merging to a placement preview in flex mode (%s)',
    (modeName) => {
      const editor = mockDeep<CoreEditor>();
      const entities = mockDeep<DrawingEntitiesManager>();
      const command = new Command();
      entities.mergeInto.mockReturnValue({
        command,
        mergedDrawingEntities: entities,
      });
      (provideEditorInstance as jest.Mock).mockReturnValue(editor);
      const serializer = mockDeep<KetSerializer>();
      const deserialized =
        mockDeep<
          NonNullable<ReturnType<KetSerializer['deserializeToDrawingEntities']>>
        >();
      deserialized.drawingEntitiesManager = entities;
      serializer.deserializeToDrawingEntities.mockReturnValue(deserialized);
      jest.mocked(KetSerializer).mockImplementation(() => serializer);

      const result = new TestMode(modeName).pasteKetFormatFragment('KET');

      if (modeName === 'flex-layout-mode') {
        expect(editor.previewStructure).toHaveBeenCalledWith(entities);
        expect(entities.mergeInto).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
      } else {
        expect(editor.previewStructure).not.toHaveBeenCalled();
        expect(entities.mergeInto).toHaveBeenCalledWith(
          editor.drawingEntitiesManager,
        );
        expect(result).toBe(command);
      }
    },
  );

  it.each<LayoutMode>([
    'flex-layout-mode',
    'snake-layout-mode',
    'sequence-layout-mode',
  ])(
    'preserves active zoom for an empty flex canvas (%s)',
    async (modeName) => {
      const editor = mockDeep<CoreEditor>();
      Object.defineProperty(editor, 'isSequenceEditInRNABuilderMode', {
        value: false,
      });
      Object.defineProperty(
        editor.drawingEntitiesManager,
        'hasDrawingEntities',
        {
          value: false,
        },
      );
      (provideEditorInstance as jest.Mock).mockReturnValue(editor);
      const mode = new TestMode(modeName);
      const paste = jest.spyOn(mode, 'pasteFromClipboard').mockResolvedValue();
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: jest.fn(),
          read: jest.fn().mockResolvedValue([]),
        },
      });

      await mode.onPaste();

      expect(paste).toHaveBeenCalledWith([], expect.any(AbortSignal));
      expect(editor.zoomToStructuresIfNeeded).toHaveBeenCalledTimes(
        modeName === 'flex-layout-mode' ? 0 : 1,
      );
    },
  );

  it('reports a failed preview and allows another paste attempt', async () => {
    const editor = mockDeep<CoreEditor>();
    Object.defineProperty(editor, 'isSequenceEditInRNABuilderMode', {
      value: false,
    });
    (provideEditorInstance as jest.Mock).mockReturnValue(editor);
    const mode = new TestMode('flex-layout-mode');
    const serializer = mockDeep<KetSerializer>();
    serializer.deserializeToDrawingEntities.mockReturnValue(
      mockDeep<
        NonNullable<ReturnType<KetSerializer['deserializeToDrawingEntities']>>
      >(),
    );
    jest.mocked(KetSerializer).mockImplementation(() => serializer);
    editor.previewStructure
      .mockImplementationOnce(() => {
        mode.cancelPaste();
        throw new Error('Preview failed');
      })
      .mockImplementation(() => mode.cancelPaste());
    const paste = jest
      .spyOn(mode, 'pasteFromClipboard')
      .mockImplementation(async (_data, signal) => {
        mode.pasteKetFormatFragment('KET', signal);
      });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: jest.fn(),
        read: jest.fn().mockResolvedValue([]),
      },
    });
    const log = jest.spyOn(KetcherLogger, 'error').mockImplementation(() => {});

    try {
      await mode.onPaste();
      await mode.onPaste();

      expect(editor.events.openErrorModal.dispatch).toHaveBeenCalledWith({
        errorTitle: 'Error Message',
        errorMessage: 'Preview failed',
      });
      expect(paste).toHaveBeenCalledTimes(2);
      expect(editor.zoomToStructuresIfNeeded).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });

  it('ignores a late clipboard read after cancellation without blocking the next paste', async () => {
    const editor = mockDeep<CoreEditor>();
    Object.defineProperty(editor, 'isSequenceEditInRNABuilderMode', {
      value: false,
    });
    (provideEditorInstance as jest.Mock).mockReturnValue(editor);
    const mode = new TestMode('flex-layout-mode');
    const firstRead = deferred<Record<string, string>>();
    const secondRead = deferred<Record<string, string>>();
    const read = jest
      .fn()
      .mockReturnValueOnce(firstRead.promise)
      .mockReturnValueOnce(secondRead.promise);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: jest.fn(), read },
    });
    const paste = jest.spyOn(mode, 'pasteFromClipboard').mockResolvedValue();

    const firstPaste = mode.onPaste();
    mode.cancelPaste();
    const secondPaste = mode.onPaste();
    firstRead.resolve({ 'text/plain': 'cancelled' });
    await firstPaste;
    await mode.onPaste();

    expect(read).toHaveBeenCalledTimes(2);
    expect(paste).not.toHaveBeenCalled();
    secondRead.resolve({ 'text/plain': 'current' });
    await secondPaste;
    expect(paste).toHaveBeenCalledTimes(1);
    expect(paste).toHaveBeenCalledWith(
      { 'text/plain': 'current' },
      expect.any(AbortSignal),
    );
    expect(editor.events.openErrorModal.dispatch).not.toHaveBeenCalled();
  });

  it('does not deserialize clipboard text resolved after cancellation', async () => {
    (provideEditorInstance as jest.Mock).mockReturnValue(
      mockDeep<CoreEditor>(),
    );
    const mode = new TestMode('flex-layout-mode');
    const controller = new AbortController();
    const pasteKet = jest.spyOn(mode, 'pasteKetFormatFragment');
    const text = deferred<string>();
    const blob = mockDeep<Blob>();
    blob.text.mockReturnValue(text.promise);
    const item = mockDeep<ClipboardItem>();
    item.getType.mockResolvedValue(blob);

    const paste = mode.pasteFromClipboard([item], controller.signal);
    controller.abort();
    text.resolve('{"root":{"nodes":[]}}');
    await paste;

    expect(pasteKet).not.toHaveBeenCalled();
  });

  it.each(['resolve', 'reject'])(
    'ignores an Indigo conversion that %ss after cancellation',
    async (outcome) => {
      (provideEditorInstance as jest.Mock).mockReturnValue(
        mockDeep<CoreEditor>(),
      );
      const ketcher = mockDeep<ReturnType<typeof ketcherProvider.getKetcher>>();
      jest.mocked(ketcherProvider.getKetcher).mockReturnValue(ketcher);
      const converted =
        deferred<Awaited<ReturnType<typeof ketcher.indigo.convert>>>();
      ketcher.indigo.convert.mockReturnValue(converted.promise);
      const mode = new TestMode('flex-layout-mode');
      const controller = new AbortController();
      const pasteKet = jest.spyOn(mode, 'pasteKetFormatFragment');
      const error = jest.spyOn(mode, 'unsupportedSymbolsError');

      const paste = mode.pasteWithIndigoConversion(
        'AC',
        SequenceType.PEPTIDE,
        controller.signal,
      );
      controller.abort();
      if (outcome === 'resolve') {
        converted.resolve({
          struct: '{"root":{"nodes":[]}}',
          format: ChemicalMimeType.KET,
        });
      } else {
        converted.reject(new Error('Conversion failed'));
      }
      await paste;

      expect(pasteKet).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    },
  );

  it.each<LayoutMode>([
    'flex-layout-mode',
    'snake-layout-mode',
    'sequence-layout-mode',
  ])(
    'does not treat placement tool changes as cancellation of a prepared paste (%s)',
    async (modeName) => {
      const editor = mockDeep<CoreEditor>();
      Object.defineProperty(editor, 'isSequenceEditInRNABuilderMode', {
        value: false,
      });
      Object.defineProperty(
        editor.drawingEntitiesManager,
        'hasDrawingEntities',
        { value: false },
      );
      jest.mocked(provideEditorInstance).mockReturnValue(editor);
      const mode = new TestMode(modeName);
      const deserialized =
        mockDeep<
          NonNullable<ReturnType<KetSerializer['deserializeToDrawingEntities']>>
        >();
      const serializer = mockDeep<KetSerializer>();
      serializer.deserializeToDrawingEntities.mockReturnValue(deserialized);
      jest.mocked(KetSerializer).mockImplementation(() => serializer);
      editor.previewStructure.mockImplementation(() => mode.cancelPaste());
      deserialized.drawingEntitiesManager.mergeInto.mockImplementation(() => {
        mode.cancelPaste();
        return {
          command: new Command(),
          mergedDrawingEntities: deserialized.drawingEntitiesManager,
        };
      });
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: jest.fn(),
          read: jest
            .fn()
            .mockResolvedValue({ 'text/plain': '{"root":{"nodes":[]}}' }),
        },
      });

      await mode.onPaste();

      expect(editor.zoomToStructuresIfNeeded).toHaveBeenCalledTimes(
        modeName === 'flex-layout-mode' ? 0 : 1,
      );
      expect(editor.events.openErrorModal.dispatch).not.toHaveBeenCalled();
      expect(editor.previewStructure).toHaveBeenCalledTimes(
        modeName === 'flex-layout-mode' ? 1 : 0,
      );
    },
  );
});
