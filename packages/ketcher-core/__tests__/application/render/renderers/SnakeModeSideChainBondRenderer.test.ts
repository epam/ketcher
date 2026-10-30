import { mock } from 'jest-mock-extended';
import { select } from 'd3';
import type { CoreEditor } from 'application/editor';
import { setEditorInstance } from 'application/editor/editorSingleton';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import type { PolymerBond } from 'domain/entities/PolymerBond';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import type { CanvasMatrix } from 'domain/entities/canvas-matrix/CanvasMatrix';
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
      matrix.getMaxHorizontalOffsetForRow.mockReturnValue(5);
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
