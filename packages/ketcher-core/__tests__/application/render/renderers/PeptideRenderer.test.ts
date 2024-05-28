import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { PeptideRenderer } from 'application/render/renderers';
import { Peptide } from 'domain/entities/Peptide';
import { peptideMonomerItem, polymerEditorTheme } from '../../../mock-data';

describe('PeptideRenderer', () => {
  it('should render peptide', () => {
    const canvas = createPolymerEditorCanvas();
    const peptide = new Peptide(peptideMonomerItem);
    const peptideRenderer = new PeptideRenderer(peptide);
    global.SVGElement.prototype.getBBox = jest.fn();
    jest
      .spyOn(global.SVGElement.prototype, 'getBBox')
      .mockImplementation(() => ({ width: 30, height: 20 }));
    peptideRenderer.show(polymerEditorTheme);

    expect(canvas).toMatchSnapshot();
  });
});
