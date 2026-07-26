import type { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import type { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
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
  const secondMonomer = polymerBond.secondMonomer;
  if (!secondMonomer) {
    throw new Error('Expected second monomer to be defined');
  }

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
        [secondMonomer.id, secondMonomer],
      ]),
    },
  } as never);
};

const setSnakeSideConnectionEditorWithEmptyMiddle = (
  polymerBond: ReturnType<typeof getFinishedPolymerBond>,
) => {
  const secondMonomer = polymerBond.secondMonomer;
  if (!secondMonomer) {
    throw new Error('Expected second monomer to be defined');
  }

  const firstCell = new Cell(
    { monomers: [polymerBond.firstMonomer] } as never,
    [new Connection(null, 90, true, polymerBond, 0, 0)],
    0,
    0,
    polymerBond.firstMonomer,
  );
  const middleCell = new Cell(
    null,
    [new Connection(null, 90, true, polymerBond, 0, 0)],
    0,
    1,
  );
  const lastCell = new Cell(
    { monomers: [secondMonomer] } as never,
    [new Connection(null, 90, true, polymerBond, 0, 0)],
    0,
    2,
    secondMonomer,
  );

  setEditorInstance({
    drawingEntitiesManager: {
      canvasMatrix: {
        polymerBondToCells: new Map([
          [polymerBond, [firstCell, middleCell, lastCell]],
        ]),
      },
      monomers: new Map([
        [polymerBond.firstMonomer.id, polymerBond.firstMonomer],
        [secondMonomer.id, secondMonomer],
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
  createPolymerEditorCanvas();

  setEditorInstance({
    mode: { modeName: 'snake-layout-mode' },
    drawingEntitiesManager: {
      canvasMatrix: undefined,
      monomers: new Map(),
    },
  } as never);

  const polymerBond = getFinishedPolymerBond(x1, y1, x2, y2);
  const secondMonomer = polymerBond.secondMonomer;
  if (!secondMonomer) {
    throw new Error('Expected second monomer to be defined');
  }

  polymerBond.firstMonomer.attachmentPointsToBonds[firstAttachmentPoint] =
    polymerBond;
  secondMonomer.attachmentPointsToBonds[secondAttachmentPoint] = polymerBond;

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

    expect(r2r2.bodyPath?.attr('d')).toMatch(
      /^M 400,400 .* 36\d+,400 .* 3600,4000/,
    );
  });

  it('should route straight vertical R2-R2 bonds downward in snake mode', () => {
    const r2r2Vertical = renderBondPath(10, 10, 10, 100, 'R2', 'R2');

    expect(r2r2Vertical.bodyPath?.attr('d')).toMatch(
      /^M 400,400 L 400,415 L 400,4000 /,
    );
  });

  it('should route vertical side-chain bonds across non-adjacent rows through a bend in snake mode', () => {
    createPolymerEditorCanvas();

    setEditorInstance({
      mode: { modeName: 'snake-layout-mode' },
      drawingEntitiesManager: {
        canvasMatrix: undefined,
        monomers: new Map(),
      },
    } as never);

    const polymerBond = getFinishedPolymerBond(10, 10, 10, 110);
    const secondMonomer = polymerBond.secondMonomer;
    if (!secondMonomer) {
      throw new Error('Expected second monomer to be defined');
    }

    polymerBond.firstMonomer.attachmentPointsToBonds.R2 = polymerBond;
    secondMonomer.attachmentPointsToBonds.R2 = polymerBond;

    polymerBond.moveToLinkedEntities();
    setSnakeSideConnectionEditorWithEmptyMiddle(polymerBond);

    mockMonomerBBox();

    const polymerBondRenderer =
      polymerBond.renderer as FlexModeOrSnakeModePolymerBondRenderer;
    polymerBondRenderer.show();

    expect(polymerBondRenderer.bodyElement?.attr('d')).toMatch(
      /^M 400,400 L 400,415 q/,
    );
  });
});
