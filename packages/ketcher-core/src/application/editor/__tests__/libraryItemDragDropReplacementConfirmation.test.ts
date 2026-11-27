import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreEditor } from 'application/editor';
import { FlexMode } from 'application/editor/modes/FlexMode';
import { Coordinates } from 'application/editor/shared/coordinates';
import { EditorHistory } from 'application/editor/EditorHistory';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../__tests__/helpers/dom';
import { coreEditorTheme } from '../../../../__tests__/mock-data';
import { Vec2 } from 'domain/entities';
import { AttachmentPointName, type MonomerItemType } from 'domain/types';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { KetMonomerClass } from 'domain/constants/monomers';

const testRenderTheme = {
  monomer: {
    color: {
      X: { regular: 'yellow', hover: 'yellow' },
    },
  },
  peptide: {
    color: {},
  },
};

describe('library replacement confirmation', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  const originalGetBBox = SVGElement.prototype.getBBox;

  beforeEach(() => {
    SVGElement.prototype.getBBox = vi
      .fn()
      .mockReturnValue({ x: 0, y: 0, width: 10, height: 10 });
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      canvas,
      theme: coreEditorTheme,
      renderersContainer: createRenderersManager(testRenderTheme),
      mode: new FlexMode(),
    });
  });

  afterEach(() => {
    EditorHistory.getInstance(editor).destroy();
    editor.destroy();
    canvas.remove();
    vi.restoreAllMocks();
    if (originalGetBBox) {
      Object.defineProperty(SVGElement.prototype, 'getBBox', {
        configurable: true,
        value: originalGetBBox,
      });
    } else {
      Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
    }
  });

  it('confirms replacement of a side-connected base with a peptide of another type', async () => {
    await editor.ensureDefaultMonomersLibraryLoaded();
    const baseItem = editor.monomersLibrary.find(
      (item) => item.props.MonomerClass === KetMonomerClass.Base,
    );
    const peptideItem = editor.monomersLibrary.find(
      (item) =>
        item.label === 'C' &&
        item.props.MonomerClass === KetMonomerClass.AminoAcid,
    );
    if (!baseItem || !peptideItem) {
      throw new Error('Required base or peptide library item not found');
    }

    const addMonomer = (item: MonomerItemType, position: Vec2) => {
      const command = editor.drawingEntitiesManager.addMonomer(item, position);
      editor.renderersContainer.update(command);
      return command.operations[0].monomer as BaseMonomer;
    };
    const target = addMonomer(baseItem, new Vec2(100, 100));
    const neighbor = addMonomer(baseItem, new Vec2(200, 100));
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.createPolymerBond(
        target,
        neighbor,
        AttachmentPointName.R3,
        AttachmentPointName.R3,
      ),
    );

    const dragDropHandler = (
      editor as unknown as {
        dragDropHandler: {
          dependencies: {
            getKetcherRootRect: () => DOMRect | undefined;
            getCanvasOffset: () => DOMRect;
          };
        };
      }
    ).dragDropHandler;
    const canvasRect = {
      left: 0,
      top: 0,
      right: 500,
      bottom: 500,
      width: 500,
      height: 500,
    } as DOMRect;
    vi.spyOn(
      dragDropHandler.dependencies,
      'getKetcherRootRect',
    ).mockReturnValue(canvasRect);
    vi.spyOn(dragDropHandler.dependencies, 'getCanvasOffset').mockReturnValue(
      canvasRect,
    );
    vi.spyOn(
      editor.transientDrawingView,
      'showReplacementHighlight',
    ).mockImplementation(() => {});
    vi.spyOn(editor.transientDrawingView, 'update').mockImplementation(
      () => {},
    );

    const renderer = target.renderer;
    if (!renderer) {
      throw new Error('Replacement target renderer was not created');
    }

    const center = Coordinates.canvasToView(renderer.center);
    const position = { x: center.x, y: center.y };
    const confirmationSpy = vi.spyOn(
      editor.events.openConfirmationDialog,
      'dispatch',
    );

    editor.events.setLibraryItemDragState.dispatch({
      item: peptideItem,
      position,
    });
    editor.events.placeLibraryItemOnCanvas.dispatch(peptideItem, position);

    expect(editor.drawingEntitiesManager.monomers.get(target.id)).toBe(target);
    expect(confirmationSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmationText:
          'The monomer type is different and side chain connections may be affected. Do you want to proceed?',
        onConfirm: expect.any(Function),
      }),
    );

    confirmationSpy.mock.calls[0][0].onConfirm();

    expect(editor.drawingEntitiesManager.monomers.get(target.id)).not.toBe(
      target,
    );
  });
});
