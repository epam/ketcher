import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { PolymerBondRenderer as SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRenderer';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { getFinishedPolymerBond } from '../../../mock-data';

type FlexModeOrSnakeModePolymerBondRenderer =
  | FlexModePolymerBondRenderer
  | SnakeModePolymerBondRenderer;

// TODO: Split to two test files.
describe('Polymer Bond Renderer', () => {
  it('should render bond', () => {
    const canvas = createPolymerEditorCanvas();
    const polymerBond = getFinishedPolymerBond(10, 10, 90, 100);
    polymerBond.moveToLinkedMonomers();
    const polymerBondRenderer =
      polymerBond.renderer as FlexModeOrSnakeModePolymerBondRenderer;
    global.SVGElement.prototype.getBBox = jest.fn();
    jest
      .spyOn(global.SVGElement.prototype, 'getBBox')
      .mockImplementation(() => ({ width: 30, height: 20 }));
    polymerBondRenderer.show();

    expect(canvas).toMatchSnapshot();
  });
});
