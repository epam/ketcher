import { BaseMode } from 'application/editor/modes/BaseMode';
import { Command } from 'domain/entities/Command';
import { Vec2 } from 'domain/entities';
import { provideEditorInstance } from '../../editorSingleton';

jest.mock('../../editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));

jest.mock('application/ketcherProvider', () => ({
  ketcherProvider: { getKetcher: jest.fn() },
}));

jest.mock('application/formatters/identifyStructFormat', () => ({
  identifyStructFormat: jest.fn(() => 'ket'),
}));

const drawingEntitiesManager = { monomers: new Map() };

jest.mock('domain/serializers/ket/ketSerializer', () => ({
  KetSerializer: jest.fn().mockImplementation(() => ({
    deserializeToDrawingEntities: jest.fn(() => ({ drawingEntitiesManager })),
  })),
}));

class TestMode extends BaseMode {
  isPasteAllowedByMode = jest.fn(() => true);
  canPasteInMode = jest.fn(() => true);

  constructor() {
    super('sequence-layout-mode');
  }

  getNewNodePosition() {
    return new Vec2(0, 0);
  }

  applyAdditionalPasteOperations() {
    return new Command();
  }

  isPasteAvailable() {
    return true;
  }

  scrollForView() {
    // not needed in these tests
  }
}

describe('BaseMode.isPasteContentValid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (provideEditorInstance as jest.Mock).mockReturnValue({
      ketcherId: 'ketcher-id',
    });
  });

  // #12682: opening a context menu checks Paste availability. That check must
  // not run the paste preparation, which deletes the selection in Sequence mode.
  it('uses the side-effect-free check and does not prepare a paste', async () => {
    const mode = new TestMode();

    await expect(mode.isPasteContentValid('{"root":{}}')).resolves.toBe(true);

    expect(mode.canPasteInMode).toHaveBeenCalledWith(drawingEntitiesManager);
    expect(mode.isPasteAllowedByMode).not.toHaveBeenCalled();
  });

  it('returns false when the mode rejects the content', async () => {
    const mode = new TestMode();
    mode.canPasteInMode.mockReturnValue(false);

    await expect(mode.isPasteContentValid('{"root":{}}')).resolves.toBe(false);
    expect(mode.isPasteAllowedByMode).not.toHaveBeenCalled();
  });
});
