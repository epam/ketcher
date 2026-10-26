import { BaseMode } from '../BaseMode';
import * as editorSingleton from '../../editorSingleton';
import { EditorHistory } from '../../EditorHistory';
import type { CoreEditor } from '../../Editor';
import { Coordinates } from '../../shared/coordinates';
import { PastePreviewView } from 'application/render/renderers/TransientView/PastePreviewView';
import { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import { MacromoleculesConverter } from '../../MacromoleculesConverter';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Command } from 'domain/entities/Command';
import { Vec2 } from 'domain/entities/vec2';
import { Subscription } from 'subscription';
import { getRGroupDefinitions } from 'domain/helpers/rGroupDefinitions';
import type { RenderersManager } from 'application/render/renderers/RenderersManager';

class TestMode extends BaseMode {
  constructor() {
    super('flex-layout-mode');
  }
  getNewNodePosition() {
    return new Vec2();
  }
  applyAdditionalPasteOperations(manager: DrawingEntitiesManager) {
    return editorSingleton
      .provideEditorInstance()
      .drawingEntitiesManager.selectDrawingEntities(manager.allEntitiesArray);
  }
  isPasteAllowedByMode() {
    return true;
  }
  isPasteAvailable() {
    return true;
  }
  scrollForView() {}
}

function ket(range: string, resth: boolean): string {
  return JSON.stringify({
    root: { nodes: [{ $ref: 'rg1' }], connections: [], templates: [] },
    rg1: {
      type: 'rgroup',
      rlogic: { number: 1, range, resth },
      atoms: [
        { label: 'C', location: [0, 0, 0] },
        { label: 'O', location: [1, 0, 0] },
      ],
      bonds: [{ type: 1, atoms: [0, 1] }],
    },
  });
}

describe('clipboard paste preview', () => {
  let editor: CoreEditor;
  let mode: TestMode;
  const historyUpdate = jest.fn();
  const show = jest.fn();
  const hide = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(PastePreviewView, 'createSvg')
      .mockReturnValue(
        document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      );
    jest
      .spyOn(Coordinates, 'viewToModel')
      .mockImplementation((p) => p.scaled(1 / 40));
    mode = new TestMode();
    const manager = new DrawingEntitiesManager();
    editor = {
      mode,
      canvas: document.createElement('div'),
      lastCursorPositionOfCanvas: new Vec2(100, 100),
      drawingEntitiesManager: manager,
      viewModel: { initialize: jest.fn() },
      events: {
        selectTool: new Subscription(),
        switchToMoleculesMode: new Subscription(),
        layoutModeChange: new Subscription(),
        mouseLeaveSequenceItem: new Subscription(),
        selectEntities: new Subscription(),
      },
      transientDrawingView: {
        showPastePreview: show,
        hidePastePreview: hide,
        update: jest.fn(),
      },
      renderersContainer: {
        update: jest.fn(),
        rgroups: new Map([[1, { setVisibility: jest.fn() }]]),
      },
      calculateAndStoreNextAutochainPosition: jest.fn(),
      zoomToStructuresIfNeeded: jest.fn(),
    } as unknown as CoreEditor;
    document.body.append(editor.canvas);
    jest
      .spyOn(editorSingleton, 'provideEditorInstance')
      .mockReturnValue(editor);
    jest
      .spyOn(EditorHistory, 'getInstance')
      .mockReturnValue({ update: historyUpdate } as unknown as EditorHistory);
    const struct = new KetSerializer().deserializeMicromolecules(
      ket('2-3', false),
    );
    MacromoleculesConverter.convertStructToDrawingEntities(struct, manager);
  });

  afterEach(() => {
    mode.destroy();
    editor.canvas.remove();
    jest.restoreAllMocks();
  });

  function logic() {
    return getRGroupDefinitions(
      editor.drawingEntitiesManager.atoms.values(),
      editor.drawingEntitiesManager.bonds.values(),
    ).get(1)!.rgroup;
  }

  it('does not modify fragments, logic or history until the confirming click', async () => {
    await mode.pasteFromClipboard({ 'text/plain': ket('1', true) });
    expect(show).toHaveBeenCalledTimes(1);
    expect(show.mock.lastCall[0].definitions.get(1).rgroup).toMatchObject({
      range: '1',
      resth: true,
    });
    expect(show.mock.lastCall[0].existingDefinitions.get(1).atoms).toHaveLength(
      2,
    );
    expect(
      editor.renderersContainer.rgroups.get(1)!.setVisibility,
    ).toHaveBeenCalledWith(false);
    expect(editor.drawingEntitiesManager.atoms.size).toBe(2);
    expect(logic()).toMatchObject({ range: '2-3', resth: false });
    expect(historyUpdate).not.toHaveBeenCalled();
    editor.canvas.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 400, clientY: 200 }),
    );
    expect(show.mock.lastCall[0].position).toEqual(new Vec2(10, 5));
    editor.canvas.dispatchEvent(
      new MouseEvent('click', { clientX: 400, clientY: 200 }),
    );
    expect(editor.drawingEntitiesManager.atoms.size).toBe(4);
    expect(logic()).toMatchObject({ range: '1', resth: true });
    expect(historyUpdate).toHaveBeenCalledTimes(1);
    expect(editor.drawingEntitiesManager.selectedEntitiesArr).toHaveLength(0);
    const command = historyUpdate.mock.lastCall[0] as Command;
    const renderers = new Proxy(
      {},
      { get: () => jest.fn() },
    ) as RenderersManager;
    command.execute(renderers);
    expect(editor.drawingEntitiesManager.selectedEntitiesArr).toHaveLength(0);
    command.invert(renderers);
    expect(editor.drawingEntitiesManager.atoms.size).toBe(2);
    command.execute(renderers);
    expect(editor.drawingEntitiesManager.atoms.size).toBe(4);
    expect(editor.drawingEntitiesManager.selectedEntitiesArr).toHaveLength(0);
    expect(hide).toHaveBeenCalled();
    const inserted = [...editor.drawingEntitiesManager.atoms.values()].slice(2);
    expect(inserted[0].monomer.position).toEqual(new Vec2(10, 5));
    editor.canvas.dispatchEvent(new MouseEvent('click'));
    expect(historyUpdate).toHaveBeenCalledTimes(1);
  });

  it.each(['Escape', 'tool', 'mode', 'destroy'])(
    'cancels with %s without changing the model',
    async (action) => {
      await mode.pasteFromClipboard({ 'text/plain': ket('1', true) });
      if (action === 'Escape')
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      if (action === 'tool') editor.events.selectTool.dispatch([]);
      if (action === 'mode') editor.events.switchToMoleculesMode.dispatch();
      if (action === 'destroy') mode.destroy();
      editor.canvas.dispatchEvent(new MouseEvent('click'));
      expect(editor.drawingEntitiesManager.atoms.size).toBe(2);
      expect(logic()).toMatchObject({ range: '2-3', resth: false });
      expect(historyUpdate).not.toHaveBeenCalled();
      expect(hide).toHaveBeenCalledTimes(1);
      expect(
        editor.renderersContainer.rgroups.get(1)!.setVisibility,
      ).toHaveBeenLastCalledWith(true);
    },
  );
});
