import type { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import type { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { SnakeMode } from 'application/editor/modes/SnakeMode';
import type { CoreEditor } from 'application/editor/Editor';
import {
  resetEditorInstance,
  setEditorInstance,
} from 'application/editor/editorSingleton';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { Connection } from 'domain/entities/canvas-matrix/Connection';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { PolymerBondRendererFactory } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRendererFactory';
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
  {
    chainsHaveBackbones = true,
    atChainStart = false,
    laneOffset = 0,
    hydrogen = false,
  }: {
    chainsHaveBackbones?: boolean;
    atChainStart?: boolean;
    laneOffset?: number;
    hydrogen?: boolean;
  } = {},
) => {
  createPolymerEditorCanvas();
  setEditorInstance({
    mode: new SnakeMode(),
    drawingEntitiesManager: {
      canvasMatrix: undefined,
      monomers: new Map(),
    },
  } as unknown as CoreEditor);

  const covalentBond = getFinishedPolymerBond(x1, y1, x2, y2);
  const polymerBond = hydrogen
    ? new HydrogenBond(covalentBond.firstMonomer, covalentBond.secondMonomer)
    : covalentBond;
  if (hydrogen) {
    PolymerBondRendererFactory.createInstance(polymerBond);
    polymerBond.firstMonomer.hydrogenBonds.push(polymerBond);
    polymerBond.secondMonomer?.hydrogenBonds.push(polymerBond);
  }
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

  const firstNode = {
    monomers: [polymerBond.firstMonomer],
  } as unknown as SubChainNode;
  const lastNode = {
    monomers: [secondMonomer],
  } as unknown as SubChainNode;
  const firstChain = {
    length: chainsHaveBackbones ? 2 : 1,
    firstNode: atChainStart ? firstNode : undefined,
    lastNode: atChainStart ? undefined : firstNode,
  };
  const secondChain = {
    length: chainsHaveBackbones ? 2 : 1,
    firstNode: atChainStart ? lastNode : undefined,
    lastNode: atChainStart ? undefined : lastNode,
  };
  const connection = () =>
    new Connection(null, 90, true, polymerBond, 0, laneOffset);
  const cells = [
    new Cell(firstNode, [connection()], 0, 0, polymerBond.firstMonomer),
    new Cell(null, [connection()], 1, 1),
    new Cell(lastNode, [connection()], 1, 2, secondMonomer),
  ];

  setEditorInstance({
    mode: new SnakeMode(),
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
  const endpointAngles = [
    polymerBondRenderer.getSideConnectionEndpointAngle(
      polymerBond.firstMonomer,
    ),
    polymerBondRenderer.getSideConnectionEndpointAngle(secondMonomer),
  ];

  resetEditorInstance();

  if (!path) {
    throw new Error('Expected the polymer bond path to be rendered');
  }

  return { path, endpointAngles };
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

  it('routes R2-R2 bonds to the right with rounded corners and backbone clearance', () => {
    const { path } = renderSnakeSideConnectionPath(10, 10, 10, 100, 'R2', 'R2');

    expect(path).toBe(
      'M 400,400 L 3629,400 q 5,0 5,5 L 3634,3995 q 0,5 -5,5 L 400,4000',
    );
  });

  it.each(['R1', 'R3'] as const)(
    'routes %s connections at chain starts to the left with matching bends and clearance',
    (attachmentPoint) => {
      const { path } = renderSnakeSideConnectionPath(
        10,
        10,
        10,
        100,
        attachmentPoint,
        attachmentPoint,
        { atChainStart: true },
      );

      expect(path).toBe(
        'M 400,400 L 371,400 q -5,0 -5,5 L 366,3995 q 0,5 5,5 L 400,4000',
      );
    },
  );

  it('rounds both bends when a side connection runs upwards', () => {
    const { path } = renderSnakeSideConnectionPath(10, 100, 10, 10, 'R2', 'R2');

    expect(path).toBe(
      'M 400,4000 L 3629,4000 q 5,0 5,-5 L 3634,405 q 0,-5 -5,-5 L 400,400',
    );
  });

  it('keeps mixed attachment-point connections on the existing snake route', () => {
    const { path } = renderSnakeSideConnectionPath(10, 10, 10, 100, 'R3', 'R2');

    expect(path).not.toContain('3624.5');
    expect(path).toContain('q');
  });

  it('keeps R3-R3 connections away from chain starts on the existing route', () => {
    const { path } = renderSnakeSideConnectionPath(10, 10, 10, 100, 'R3', 'R3');

    expect(path).not.toContain('375.5');
  });

  it('keeps overlapping outer connections in separate lanes', () => {
    const { path: firstPath } = renderSnakeSideConnectionPath(
      10,
      10,
      10,
      100,
      'R3',
      'R3',
      { atChainStart: true },
    );
    const { path: secondPath } = renderSnakeSideConnectionPath(
      10,
      10,
      10,
      100,
      'R3',
      'R3',
      { atChainStart: true, laneOffset: 1 },
    );

    expect(firstPath).toContain('L 366,3995');
    expect(secondPath).toContain('L 363,3995');
  });

  it('aligns occupied attachment indicators with the outer side of both endpoints', () => {
    const { endpointAngles: leftAngles } = renderSnakeSideConnectionPath(
      10,
      10,
      10,
      100,
      'R3',
      'R3',
      { atChainStart: true },
    );
    const { endpointAngles: rightAngles } = renderSnakeSideConnectionPath(
      10,
      10,
      10,
      100,
      'R2',
      'R2',
    );

    expect(leftAngles).toEqual([0, 0]);
    expect(rightAngles).toEqual([Math.PI, Math.PI]);
  });

  it('keeps hydrogen bonds between chain starts on the existing route', () => {
    const { path } = renderSnakeSideConnectionPath(
      10,
      10,
      10,
      100,
      'R3',
      'R3',
      { atChainStart: true, hydrogen: true },
    );

    expect(path).not.toContain('375.5');
  });

  it('keeps R2-R2 connections between standalone monomers on the existing route', () => {
    const { path } = renderSnakeSideConnectionPath(
      10,
      10,
      10,
      100,
      'R2',
      'R2',
      { chainsHaveBackbones: false },
    );
    expect(path).toContain('q');
  });
});
