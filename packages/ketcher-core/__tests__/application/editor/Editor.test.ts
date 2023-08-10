import { CoreEditor } from 'application/editor';
import { PeptideTool } from 'application/editor/tools/Peptide';
import { createPolymerEditorCanvas } from '../../helpers/dom';

describe('CoreEditor', () => {
  it('should track dom events and trigger handlers', () => {
    const canvas: SVGSVGElement = createPolymerEditorCanvas();
    const editor: CoreEditor = new CoreEditor({ canvas, theme: {} });
    const onMousemove = jest.fn();
    jest
      .spyOn(PeptideTool.prototype, 'mousemove')
      .mockImplementation(onMousemove);
    editor.selectTool('peptide');
    canvas.dispatchEvent(new Event('mousemove', { bubbles: true }));
    expect(onMousemove).toHaveBeenCalled();
  });
});
