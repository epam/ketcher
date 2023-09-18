import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { getFinishedPolymerBond } from '../../../mock-data';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';

describe('Polymer Bond Renderer', () => {
  it('should render bond', () => {
    const canvas: SVGSVGElement = createPolymerEditorCanvas();
    const polymerBond = getFinishedPolymerBond(0.25, 0.25, 2.25, 2.5);
    polymerBond.moveToLinkedMonomers();
    const polymerBondRenderer = new PolymerBondRenderer(polymerBond);
    global.SVGElement.prototype.getBBox = jest.fn();
    jest
      .spyOn(global.SVGElement.prototype, 'getBBox')
      .mockImplementation(() => ({ width: 30, height: 20 }));
    polymerBondRenderer.show();

    expect(canvas).toMatchSnapshot();
  });
});
