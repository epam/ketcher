import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import {
  setEditorInstance,
  resetEditorInstance,
} from 'application/editor/editorSingleton';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { Connection } from 'domain/entities/canvas-matrix/Connection';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { getFinishedPolymerBond } from '../../../mock-data';

type FlexModeOrSnakeModePolymerBondRenderer =
  | FlexModePolymerBondRenderer
  | SnakeModePolymerBondRenderer;

const mockMonomerBBox = () => {
  global.SVGElement.prototype.getBBox = jest.fn();
  jest
    .spyOn(global.SVGElement.prototype, 'getBBox')
    .mockImplementation(() => ({ width: 30, height: 20 } as DOMRect));
};

const setSnakeSideConnectionEditor = (
  polymerBond: ReturnType<typeof getFinishedPolymerBond>,
) => {
  const firstCell = new Cell(
    { monomers: [polymerBond.firstMonomer] } as never,
    [new Connection(null, 90, true, polymerBond, 0, 0)],
    0,
    0,
    polymerBond.firstMonomer,
  );
  const secondCell = new Cell(
    null,
    [new Connection(null, 90, true, polymerBond, 0, 0)],
    0,
    1,
    polymerBond.secondMonomer,
  );

  setEditorInstance({
    drawingEntitiesManager: {
      canvasMatrix: {
        polymerBondToCells: new Map([[polymerBond, [firstCell, secondCell]]]),
      },
      monomers: new Map([
        [polymerBond.firstMonomer.id, polymerBond.firstMonomer],
        [polymerBond.secondMonomer!.id, polymerBond.secondMonomer!],
      ]),
    },
  } as never);
};

const renderBondPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  firstAttachmentPoint: 'R1' | 'R2' | 'R3',
  secondAttachmentPoint: 'R1' | 'R2' | 'R3',
) => {
  const canvas = createPolymerEditorCanvas();

  setEditorInstance({
    mode: { modeName: 'snake-layout-mode' },
    drawingEntitiesManager: {
      canvasMatrix: undefined,
      monomers: new Map(),
    },
  } as never);

  const polymerBond = getFinishedPolymerBond(x1, y1, x2, y2);

  polymerBond.firstMonomer.attachmentPointsToBonds[firstAttachmentPoint] =
    polymerBond;
  polymerBond.secondMonomer!.attachmentPointsToBonds[secondAttachmentPoint] =
    polymerBond;

  polymerBond.moveToLinkedEntities();
  setSnakeSideConnectionEditor(polymerBond);

  mockMonomerBBox();

  const polymerBondRenderer =
    polymerBond.renderer as FlexModeOrSnakeModePolymerBondRenderer;
  polymerBondRenderer.show();

  const bodyPath = polymerBondRenderer.bodyElement;

  return {
    bodyPath,
    polymerBond,
  };
};

// TODO: Split to two test files.
describe('Polymer Bond Renderer', () => {
  afterEach(() => {
    resetEditorInstance();
  });

  it('should render bond', () => {
    const canvas = createPolymerEditorCanvas();
    const polymerBond = getFinishedPolymerBond(10, 10, 90, 100);
    polymerBond.moveToLinkedEntities();
    const polymerBondRenderer =
      polymerBond.renderer as FlexModeOrSnakeModePolymerBondRenderer;
    mockMonomerBBox();
    polymerBondRenderer.show();

    expect(canvas).toMatchSnapshot();
  });

  it('should route only R2-R2 bonds from the right side in snake mode', () => {
    const r2r2 = renderBondPath(10, 10, 90, 100, 'R2', 'R2');
    const r3r2 = renderBondPath(10, 10, 90, 100, 'R3', 'R2');

    expect(r2r2.bodyPath?.attr('d')).toMatch(
      /^M 400,400 L 3649,400 L 3649,4000 L 3600,4000 /,
    );
    expect(r3r2.bodyPath?.attr('d')).not.toMatch(
      /^M 400,400 L 3649,400 L 3649,4000 L 3600,4000 /,
    );
  });
});
