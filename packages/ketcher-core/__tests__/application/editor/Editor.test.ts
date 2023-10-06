import { CoreEditor } from 'application/editor';
import { MonomerTool } from 'application/editor/tools/Monomer';
import { createPolymerEditorCanvas } from '../../helpers/dom';

describe('CoreEditor', () => {
  it('should track dom events and trigger handlers', () => {
    const canvas: SVGSVGElement = createPolymerEditorCanvas();
    const editor: CoreEditor = new CoreEditor({ canvas, theme: {} });
    const onMousemove = jest.fn();
    jest
      .spyOn(MonomerTool.prototype, 'mousemove')
      .mockImplementation(onMousemove);
    editor.selectTool('monomer');
    canvas.dispatchEvent(new Event('mousemove', { bubbles: true }));
    expect(onMousemove).toHaveBeenCalled();
  });
});
