import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRenderer';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { getFinishedPolymerBond } from '../../../mock-data';

describe('Polymer Bond Renderer', () => {
  it('should render bond', () => {
    const canvas = createPolymerEditorCanvas();
    const polymerBond = getFinishedPolymerBond(10, 10, 90, 100);
    polymerBond.moveToLinkedMonomers();
    const polymerBondRenderer = polymerBond.renderer as PolymerBondRenderer;
    global.SVGElement.prototype.getBBox = jest.fn();
    jest
      .spyOn(global.SVGElement.prototype, 'getBBox')
      .mockImplementation(() => ({ width: 30, height: 20 }));
    polymerBondRenderer.show();

    expect(canvas).toMatchSnapshot();
  });
});
