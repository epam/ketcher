import { mock } from 'jest-mock-extended';
import { select } from 'd3';
import type { CoreEditor } from 'application/editor';
import { setEditorInstance } from 'application/editor/editorSingleton';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import type { PolymerBond } from 'domain/entities/PolymerBond';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { CanvasMatrix } from 'domain/entities/canvas-matrix/CanvasMatrix';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import { Matrix } from 'domain/entities/canvas-matrix/Matrix';
import { AttachmentPointName } from 'domain/types';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { Connection } from 'domain/entities/canvas-matrix/Connection';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { getFinishedPolymerBond } from '../../../mock-data';

describe('Snake-mode side-chain destination lanes', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it.each([true, false])(
    'uses one row baseline when sharing a destination: %s',
    (sharedDestination) => {
      const canvas = createPolymerEditorCanvas();
      const bonds = [1, 2].map(() => {
        const bond = getFinishedPolymerBond(0, 0, 4, 5);
        bond.moveToLinkedEntities();
        jest.spyOn(bond, 'isSideChainConnection', 'get').mockReturnValue(true);
        return bond;
      });
      const destinationNode = new MonomerSequenceNode(bonds[0].firstMonomer);
      const destination = new Cell(
        destinationNode,
        bonds.map(
          (bond, index) =>
            new Connection(
              destinationNode,
              { x: 0, y: 90 },
              false,
              bond,
              index + 1,
              0,
            ),
        ),
        1,
        1,
      );
      const cellsByBond = new Map(
        bonds.map((bond, index) => {
          const start = new Cell(
            new MonomerSequenceNode(bond.firstMonomer),
            [
              new Connection(destinationNode, 0, false, bond, index + 1, 0),
              new Connection(
                null,
                0,
                false,
                mock<PolymerBond>(),
                index === 0 ? 5 : 0,
                0,
              ),
            ],
            0,
            0,
          );
          const end = sharedDestination
            ? destination
            : new Cell(
                destinationNode,
                [destination.connections[index]],
                index + 1,
                1,
              );
          return [bond, [start, end]];
        }),
      );
      const matrix = mock<CanvasMatrix>();
      matrix.polymerBondToCells = cellsByBond;
      matrix.getMaxHorizontalOffsetForBond.mockReturnValue(5);
      const manager = mock<DrawingEntitiesManager>();
      manager.canvasMatrix = matrix;
      const editor = mock<CoreEditor>();
      editor.drawingEntitiesManager = manager;
      setEditorInstance(editor);

      const paths = bonds.map((bond) => {
        const renderer = new SnakeModePolymerBondRenderer(bond);
        renderer.appendBond(select(canvas).append('g'));
        return renderer.bodyElement?.attr('d');
      });

      // Both paths enter y=200, with separate lanes three pixels apart.
      expect(paths[0]).toContain('V 163 ');
      expect(paths[1]).toContain('V 166 ');
    },
  );
});

describe('Snake-mode inter-row routing groups', () => {
  function createMatrix(routes: number[][]) {
    const chains = new ChainsCollection();
    const initialMatrix = new Matrix<Cell>();
    const bonds = routes.map(([x1, y1, x2, y2]) => {
      const bond = getFinishedPolymerBond(x1, y1, x2, y2);
      const first = bond.firstMonomer;
      const second = bond.secondMonomer;
      if (!second) {
        throw new Error('Expected a finished bond');
      }
      first.setBond(AttachmentPointName.R3, bond);
      second.setBond(AttachmentPointName.R3, bond);
      chains.chains.push(new Chain(first), new Chain(second));
      initialMatrix.set(
        y1,
        x1,
        new Cell(new MonomerSequenceNode(first), [], x1, y1, first),
      );
      initialMatrix.set(
        y2,
        x2,
        new Cell(new MonomerSequenceNode(second), [], x2, y2, second),
      );
      return bond;
    });
    return { matrix: new CanvasMatrix(chains, { initialMatrix }), bonds };
  }

  it('keeps a distant corridor independent of a busier one on the same rows', () => {
    const { matrix, bonds } = createMatrix([
      [0, 0, 2, 1],
      [4, 0, 8, 1],
      [5, 0, 7, 1],
      [6, 0, 9, 1],
    ]);
    expect(matrix.getMaxHorizontalOffsetForBond(bonds[0])).toBe(1);
    const sharedOffsets = bonds
      .slice(1)
      .map((bond) => matrix.getMaxHorizontalOffsetForBond(bond));
    expect(new Set(sharedOffsets).size).toBe(1);
    expect(sharedOffsets[0]).toBeGreaterThan(1);
  });

  it('does not use offsets from connections in another row gap', () => {
    const alone = createMatrix([[0, 1, 2, 2]]);
    const busy = createMatrix([
      [0, 1, 2, 2],
      [3, 0, 7, 1],
      [4, 0, 6, 1],
      [5, 0, 8, 1],
    ]);
    expect(busy.matrix.getMaxHorizontalOffsetForBond(busy.bonds[0])).toBe(
      alone.matrix.getMaxHorizontalOffsetForBond(alone.bonds[0]),
    );
  });
});
