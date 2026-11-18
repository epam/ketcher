import type { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import type { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { SideChainConnectionBondRendererUtility } from 'application/render/renderers/PolymerBondRenderer/SideChainConnectionBondRendererUtility';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { Connection } from 'domain/entities/canvas-matrix/Connection';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { getFinishedPolymerBond } from '../../../mock-data';

type FlexModeOrSnakeModePolymerBondRenderer =
  FlexModePolymerBondRenderer | SnakeModePolymerBondRenderer;

// TODO: Split to two test files.
describe('Polymer Bond Renderer', () => {
  it('should render bond', () => {
    const canvas = createPolymerEditorCanvas();
    const polymerBond = getFinishedPolymerBond(10, 10, 90, 100);
    polymerBond.moveToLinkedEntities();
    const polymerBondRenderer =
      polymerBond.renderer as FlexModeOrSnakeModePolymerBondRenderer;
    globalThis.SVGElement.prototype.getBBox = jest.fn();
    jest
      .spyOn(globalThis.SVGElement.prototype, 'getBBox')
      .mockImplementation(() => ({ width: 30, height: 20 }) as DOMRect);
    polymerBondRenderer.show();

    expect(canvas).toMatchSnapshot();
  });

  it('keeps a vertical side-chain bond in its lane when the bend reverses', () => {
    createPolymerEditorCanvas();
    const bond = getFinishedPolymerBond(10, 10, 10, 100);
    const connection = new Connection(null, 90, true, bond, 0, 0);
    const cell = new Cell(null, [connection], 0, 0);
    const route = {
      cell,
      connection,
      horizontal: true,
      turnPoint: 100,
      turnPointIsUsed: true,
    };

    const bendFromRight =
      SideChainConnectionBondRendererUtility.calculatePathPartAndTurnPoint({
        ...route,
        direction: 180,
      });
    const bendFromLeft =
      SideChainConnectionBondRendererUtility.calculatePathPartAndTurnPoint({
        ...route,
        direction: 0,
      });

    expect(bendFromRight.pathPart).toMatch(/^H 105 q .* -5,5 /);
    expect(bendFromLeft.pathPart).toMatch(/^H 95 q .* 5,5 /);
  });
});
