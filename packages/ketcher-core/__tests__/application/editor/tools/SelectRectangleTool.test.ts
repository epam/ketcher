import { CoreEditor } from 'application/editor';
import { PeptideRenderer } from 'application/render/renderers/PeptideRenderer';
import {
  getFinishedPolymerBond,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../../mock-data';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { SelectRectangle } from 'application/editor/tools/SelectRectangle';

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
    const initialPosition = polymerBond.position;

    expect(polymerBond.selected).toBeFalsy();
    selectRectangleTool.mousedown(event);
    selectRectangleTool.mousemove();
    expect(polymerBond.selected).toBeTruthy();
    expect(polymerBond.position).not.toEqual(initialPosition);
  });
});
