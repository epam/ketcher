import type { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import type { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import type { CoreEditor } from 'application/editor/Editor';
import {
  resetEditorInstance,
  setEditorInstance,
} from 'application/editor/editorSingleton';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { Connection } from 'domain/entities/canvas-matrix/Connection';
import type { SubChainNode } from 'domain/entities/monomer-chains/types';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { getFinishedPolymerBond } from '../../../mock-data';

type FlexModeOrSnakeModePolymerBondRenderer =
  FlexModePolymerBondRenderer | SnakeModePolymerBondRenderer;

const renderSnakeSideConnectionPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  firstAttachmentPoint: 'R1' | 'R2' | 'R3',
  secondAttachmentPoint: 'R1' | 'R2' | 'R3',
  chainsHaveBackbones = true,
): string => {
  createPolymerEditorCanvas();
  setEditorInstance({
    mode: { modeName: 'snake-layout-mode' },
    drawingEntitiesManager: {
      canvasMatrix: undefined,
      monomers: new Map(),
    },
  } as unknown as CoreEditor);

  const polymerBond = getFinishedPolymerBond(x1, y1, x2, y2);
  const secondMonomer = polymerBond.secondMonomer;

  if (!secondMonomer) {
    throw new Error('Expected a finished polymer bond');
  }

  polymerBond.firstMonomer.attachmentPointsToBonds[firstAttachmentPoint] =
    polymerBond;
  secondMonomer.attachmentPointsToBonds[secondAttachmentPoint] = polymerBond;
  polymerBond.moveToLinkedEntities();
  const additionalRowMonomer = chainsHaveBackbones
    ? getFinishedPolymerBond(90, y1, 90, y2).firstMonomer
    : undefined;
  const firstChain = { length: chainsHaveBackbones ? 2 : 1 };
  const secondChain = { length: chainsHaveBackbones ? 2 : 1 };

  const firstNode = {
    monomers: [polymerBond.firstMonomer],
  } as unknown as SubChainNode;
  const lastNode = {
    monomers: [secondMonomer],
  } as unknown as SubChainNode;
  const connection = () => new Connection(null, 90, true, polymerBond, 0, 0);
  const cells = [
    new Cell(firstNode, [connection()], 0, 0, polymerBond.firstMonomer),
    new Cell(null, [connection()], 1, 1),
    new Cell(lastNode, [connection()], 1, 2, secondMonomer),
  ];

  setEditorInstance({
    drawingEntitiesManager: {
      canvasMatrix: {
        polymerBondToCells: new Map([[polymerBond, cells]]),
        chainsCollection: {
          monomerToChain: new Map([
            [polymerBond.firstMonomer, firstChain],
            [secondMonomer, secondChain],
          ]),
        },
      },
      monomers: new Map([
        [polymerBond.firstMonomer.id, polymerBond.firstMonomer],
        [secondMonomer.id, secondMonomer],
        ...(additionalRowMonomer
          ? ([[additionalRowMonomer.id, additionalRowMonomer]] as const)
          : []),
      ]),
    },
  } as unknown as CoreEditor);

  global.SVGElement.prototype.getBBox = jest.fn();
  jest
    .spyOn(global.SVGElement.prototype, 'getBBox')
    .mockImplementation(() => ({ width: 30, height: 20 }) as DOMRect);

  const polymerBondRenderer =
    polymerBond.renderer as SnakeModePolymerBondRenderer;
  polymerBondRenderer.show();
  const path = polymerBondRenderer.bodyElement?.attr('d');

  resetEditorInstance();

  if (!path) {
    throw new Error('Expected the polymer bond path to be rendered');
  }

  return path;
};

// TODO: Split to two test files.
describe('Polymer Bond Renderer', () => {
  it('should render bond', () => {
    const canvas = createPolymerEditorCanvas();
    const polymerBond = getFinishedPolymerBond(10, 10, 90, 100);
    polymerBond.moveToLinkedEntities();
    const polymerBondRenderer =
      polymerBond.renderer as FlexModeOrSnakeModePolymerBondRenderer;
    global.SVGElement.prototype.getBBox = jest.fn();
    jest
      .spyOn(global.SVGElement.prototype, 'getBBox')
      .mockImplementation(() => ({ width: 30, height: 20 }) as DOMRect);
    polymerBondRenderer.show();

    expect(canvas).toMatchSnapshot();
  });

  it('routes an R2-R2 connection outside the right edge in snake mode', () => {
    const path = renderSnakeSideConnectionPath(
      10,
      10,
      10,
      100,
      'R2',
      'R2',
      true,
    );
    const coordinates = Array.from(path.matchAll(/[ML] (\d+),(\d+)/g)).map(
      ([, x, y]) => ({ x: Number(x), y: Number(y) }),
    );

    expect(coordinates).toHaveLength(4);
    expect(coordinates[0]).toEqual({ x: 400, y: 400 });
    expect(coordinates[3]).toEqual({ x: 400, y: 4000 });
    expect(coordinates[1].x).toBeGreaterThan(3600);
    expect(coordinates[2].x).toBe(coordinates[1].x);
  });

  it('keeps non-R2-R2 side connections on the existing snake route', () => {
    const r2ToR2Path = renderSnakeSideConnectionPath(
      10,
      10,
      10,
      100,
      'R2',
      'R2',
      true,
    );
    const r3ToR2Path = renderSnakeSideConnectionPath(
      10,
      10,
      10,
      100,
      'R3',
      'R2',
      true,
    );

    expect(r3ToR2Path).not.toBe(r2ToR2Path);
    expect(r2ToR2Path).not.toContain('q');
    expect(r3ToR2Path).toContain('q');
  });

  it('keeps R2-R2 connections between standalone monomers on the existing route', () => {
    const path = renderSnakeSideConnectionPath(
      10,
      10,
      10,
      100,
      'R2',
      'R2',
      false,
    );
    expect(path).toContain('q');
  });
});
