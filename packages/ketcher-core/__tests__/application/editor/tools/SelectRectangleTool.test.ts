import { CoreEditor } from 'application/editor';
import { PeptideRenderer } from 'application/render/renderers/PeptideRenderer';
import {
  getFinishedPolymerBond,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../../mock-data';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { SelectRectangle } from 'application/editor/tools/SelectRectangle';
import { Vec2 } from 'domain/entities/vec2';
import { BaseMonomerRenderer } from 'application/render/renderers';

jest.mock('d3', () => {
  return {
    brush() {
      return {
        on() {},
      };
    },
    select() {
      return {
        call() {
          return this;
        },
        insert() {
          return this;
        },
        select() {
          return this;
        },
        attr() {
          return this;
        },
        style() {
          return this;
        },
      };
    },
  };
});

describe('Select Rectangle Tool', () => {
  it('should select drawing entity on mousedown', () => {
    const polymerBond = getFinishedPolymerBond(0, 0, 10, 10);
    const event = {
      target: {
        __data__: polymerBond.renderer,
      },
    };
    const selectRectangleTool = new SelectRectangle(
      new CoreEditor({
        theme: polymerEditorTheme,
        canvas: createPolymerEditorCanvas(),
      }),
    );

    expect(polymerBond.selected).toBeFalsy();
    selectRectangleTool.mousedown(event);
    expect(polymerBond.selected).toBeTruthy();
  });

  it('should initiate the render of peptide mousedown', () => {
    const canvas: SVGSVGElement = createPolymerEditorCanvas();
    const editor: CoreEditor = new CoreEditor({
      canvas,
      theme: polymerEditorTheme,
    });
    const onShow = jest.fn();
    jest.spyOn(PeptideRenderer.prototype, 'show').mockImplementation(onShow);
    editor.events.selectMonomer.dispatch(peptideMonomerItem);
    canvas.dispatchEvent(new Event('mouseover', { bubbles: true }));
    expect(onShow).toHaveBeenCalled();
  });

  it('should move selected entity', () => {
    const canvas: SVGSVGElement = createPolymerEditorCanvas();
    const editor = new CoreEditor({
      theme: polymerEditorTheme,
      canvas,
    });

    const modelChanges = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(0, 0),
    );
    editor.renderersContainer.update(modelChanges);
    const peptide = Array.from(editor.drawingEntitiesManager.monomers)[0][1];
    const onMove = jest.fn();
    jest
      .spyOn(BaseMonomerRenderer.prototype, 'moveSelection')
      .mockImplementation(onMove);

    const selectRectangleTool = new SelectRectangle(editor);

    const initialPosition = peptide.position;
    const event = {
      target: {
        __data__: peptide.renderer,
      },
      pageX: initialPosition.x,
      pageY: initialPosition.y,
    };

    editor.drawingEntitiesManager.selectDrawingEntity(peptide);
    selectRectangleTool.mousedown(event);
    editor.lastCursorPosition.x = initialPosition.x + 100;
    editor.lastCursorPosition.y = initialPosition.y + 100;

    selectRectangleTool.mousemove();
    selectRectangleTool.mouseup(event);

    expect(onMove).toHaveBeenCalled();
  });
});
