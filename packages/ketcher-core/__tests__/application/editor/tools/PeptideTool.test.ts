import { CoreEditor } from 'application/editor';
import { PeptideRenderer } from 'application/render/renderers/PeptideRenderer';
import { peptideMonomerItem, polymerEditorTheme } from '../../../mock-data';
import { createPolymerEditorCanvas } from '../../../helpers/dom';

describe('PeptideTool', () => {
  it('should initiate the render of peptide preview on mouseover event', () => {
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
});
